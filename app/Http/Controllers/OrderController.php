<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentType;
use App\Enums\UserRole;
use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use App\Models\Product;
use App\Services\OrderCreationService;
use App\Services\OrderApprovalService;
use App\Services\OrderFulfillmentService;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderCreationService $orderCreationService,
        private readonly OrderApprovalService $orderApprovalService,
        private readonly OrderFulfillmentService $orderFulfillmentService,
        private readonly AuditService $auditService,
    ) {}

    /**
     * Daftar semua order (filtered by role).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = Order::with(['buyer', 'seller', 'items.product']);

        // Filter berdasarkan scope data
        if (! $user->can('view-all-data')) {
            $query->where(function ($q) use ($user) {
                $q->where('buyer_id', $user->id)
                    ->orWhere('seller_id', $user->id);
            });
        }

        // Filter status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $query->where('order_number', 'like', '%' . $request->search . '%');
        }

        $orders = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Form buat PO baru.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        // Produk yang tersedia
        $products = Product::with('prices')
            ->where('is_active', true)
            ->get()
            ->map(function (Product $product) use ($user) {
                $tier = match ($user->role) {
                    UserRole::Distributor => 'pusat',
                    UserRole::Agen => 'agen',
                    default => 'pusat',
                };

                $price = $product->prices->where('tier', $tier)->first();

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'image' => $product->image,
                    'price' => $price?->price ?? 0,
                    'unit' => $product->unit,
                ];
            });

        $creditInfo = null;
        if ($user->can('order-with-credit')) {
            $creditInfo = $user->getCreditInfo();
        }

        return Inertia::render('Orders/Create', [
            'products' => $products,
            'creditInfo' => $creditInfo,
            'canUseCredit' => $user->can('order-with-credit'),
        ]);
    }

    /**
     * Simpan PO baru.
     */
    public function store(StoreOrderRequest $request): RedirectResponse
    {

        try {
            $order = $this->orderCreationService->createOrder(
                buyer: $request->user(),
                items: $request->items,
                paymentType: PaymentType::from($request->payment_type),
                notes: $request->notes,
            );

            return redirect()->route('orders.show', $order)
                ->with('success', 'Purchase Order berhasil dibuat.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Detail order.
     */
    public function show(Request $request, Order $order): Response
    {
        $this->authorizeOrderAccess($request->user(), $order);

        $order->load(['buyer', 'seller', 'items.product', 'receivable.payments']);

        return Inertia::render('Orders/Show', [
            'order' => $order,
        ]);
    }

    /**
     * Approve PO (oleh seller/admin).
     */
    public function approve(Request $request, Order $order): RedirectResponse
    {
        try {
            $this->orderApprovalService->approveOrder($order, $request->user());

            return back()->with('success', 'PO berhasil disetujui.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Reject PO.
     */
    public function reject(Request $request, Order $order): RedirectResponse
    {
        $request->validate(['reason' => 'required|string|max:500']);

        try {
            $this->orderApprovalService->rejectOrder($order, $request->user(), $request->reason);

            return back()->with('success', 'PO ditolak.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Ship order (Super Admin only).
     */
    public function ship(Request $request, Order $order): RedirectResponse
    {
        try {
            $this->orderFulfillmentService->shipOrder($order);

            return back()->with('success', 'PO ditandai sebagai dikirim.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Deliver/confirm order (buyer confirms).
     */
    public function deliver(Request $request, Order $order): RedirectResponse
    {
        try {
            $this->orderFulfillmentService->deliverOrder($order);

            return back()->with('success', 'Barang dikonfirmasi diterima.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Print Label untuk pengiriman.
     */
    public function printLabel(Request $request, Order $order): Response
    {
        $this->authorizeOrderAccess($request->user(), $order);
        $order->load(['buyer.territory', 'seller', 'items.product']);

        return Inertia::render('Orders/PrintLabel', [
            'order' => $order,
        ]);
    }

    /**
     * Cek akses user ke order.
     */
    private function authorizeOrderAccess(mixed $user, Order $order): void
    {
        if ($user->can('view-all-data')) {
            return;
        }

        if ($order->buyer_id !== $user->id && $order->seller_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses ke order ini.');
        }
    }
}
