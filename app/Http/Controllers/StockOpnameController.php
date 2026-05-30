<?php

namespace App\Http\Controllers;

use App\Enums\StockOpnameType;
use App\Enums\UserRole;
use App\Models\Inventory;
use App\Models\StockOpname;
use App\Models\Product;
use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class StockOpnameController extends Controller
{
    public function __construct(
        private readonly AuditService $auditService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = StockOpname::with(['product', 'user']);

        if (! $user->can('view-all-data')) {
            $query->where('user_id', $user->id);
        }

        $opnames = $query->latest()->paginate(15);

        return Inertia::render('Opname/Index', [
            'opnames' => $opnames,
            'products' => Product::where('is_active', true)->get(['id', 'name', 'sku']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'actual_qty' => 'required|integer|min:0',
            'type' => 'required|in:opname,reject,adjustment',
            'reason' => 'required_if:type,reject,adjustment|string|max:500',
        ]);

        $user = $request->user();

        // Get current system qty from inventory
        $inventory = Inventory::firstOrCreate(
            ['user_id' => $user->id, 'product_id' => $request->product_id],
            ['qty' => 0]
        );

        $systemQty = $inventory->qty;
        
        // For reject, actual_qty is the new usable quantity. Or we just calculate difference.
        // If type is reject, and they say actual_qty is X, it means (system_qty - X) is rejected.
        $difference = $request->actual_qty - $systemQty;

        DB::transaction(function () use ($request, $user, $inventory, $systemQty, $difference) {
            StockOpname::create([
                'user_id' => $user->id,
                'product_id' => $request->product_id,
                'system_qty' => $systemQty,
                'actual_qty' => $request->actual_qty,
                'difference' => $difference,
                'type' => $request->type, // This will be cast to Enum if configured correctly in Model
                'reason' => $request->reason,
            ]);

            // Update inventory
            $inventory->qty = $request->actual_qty;
            $inventory->save();

            $this->auditService->log(
                user: $user,
                actionType: \App\Enums\AuditAction::StockOpname,
                description: "Melakukan {$request->type} pada produk ID {$request->product_id}. Stok disesuaikan: {$difference}",
                entity: clone $inventory,
            );
        });

        return back()->with('success', 'Laporan Stock Opname berhasil disimpan dan stok disesuaikan.');
    }
}
