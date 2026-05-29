<?php

namespace App\Http\Controllers;

use App\Enums\PriceTier;
use App\Models\Product;
use App\Models\ProductPrice;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function __construct(
        private readonly AuditService $auditService,
    ) {}

    /**
     * Daftar produk.
     */
    public function index(Request $request): Response
    {
        $query = Product::with('prices');

        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('sku', 'like', '%' . $request->search . '%');
            });
        }

        $products = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Form tambah produk.
     */
    public function create(): Response
    {
        return Inertia::render('Products/Create');
    }

    /**
     * Simpan produk baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:150|unique:products',
            'sku' => 'required|string|max:50|unique:products',
            'description' => 'nullable|string|max:1000',
            'unit' => 'required|string|max:20',
            'weight_grams' => 'nullable|integer|min:1',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'price_pusat' => 'required|numeric|min:0',
            'price_distributor' => 'required|numeric|min:0',
            'price_agen' => 'required|numeric|min:0',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $product = Product::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'sku' => $request->sku,
            'description' => $request->description,
            'unit' => $request->unit,
            'weight_grams' => $request->weight_grams,
            'image' => $imagePath,
        ]);

        // Create 3-tier pricing
        foreach (PriceTier::cases() as $tier) {
            ProductPrice::create([
                'product_id' => $product->id,
                'tier' => $tier,
                'price' => $request->input('price_' . $tier->value),
                'min_qty' => 1,
            ]);
        }

        $this->auditService->log(
            user: $request->user(),
            actionType: 'CREATE_PRODUCT',
            description: "Menambahkan produk baru: {$product->name} (SKU: {$product->sku})",
            entity: $product,
        );

        return redirect()->route('products.index')
            ->with('success', 'Produk berhasil ditambahkan.');
    }

    /**
     * Form edit produk.
     */
    public function edit(Product $product): Response
    {
        $product->load('prices');

        return Inertia::render('Products/Edit', [
            'product' => $product,
        ]);
    }

    /**
     * Update produk.
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:150|unique:products,name,' . $product->id,
            'sku' => 'required|string|max:50|unique:products,sku,' . $product->id,
            'description' => 'nullable|string|max:1000',
            'unit' => 'required|string|max:20',
            'weight_grams' => 'nullable|integer|min:1',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'price_pusat' => 'required|numeric|min:0',
            'price_distributor' => 'required|numeric|min:0',
            'price_agen' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $oldValues = $product->toArray();

        if ($request->hasFile('image')) {
            $product->image = $request->file('image')->store('products', 'public');
        }

        $product->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'sku' => $request->sku,
            'description' => $request->description,
            'unit' => $request->unit,
            'weight_grams' => $request->weight_grams,
            'is_active' => $request->is_active ?? true,
        ]);

        // Update prices
        foreach (PriceTier::cases() as $tier) {
            ProductPrice::updateOrCreate(
                ['product_id' => $product->id, 'tier' => $tier],
                ['price' => $request->input('price_' . $tier->value)],
            );
        }

        $this->auditService->log(
            user: $request->user(),
            actionType: 'UPDATE_PRODUCT',
            description: "Mengubah data produk: {$product->name}",
            entity: $product,
            oldValues: $oldValues,
            newValues: $product->fresh()->toArray(),
        );

        return redirect()->route('products.index')
            ->with('success', 'Produk berhasil diperbarui.');
    }

    /**
     * Hapus produk (soft delete).
     */
    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $this->auditService->log(
            user: $request->user(),
            actionType: 'DELETE_PRODUCT',
            description: "Menghapus produk: {$product->name} (SKU: {$product->sku})",
            entity: $product,
        );

        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'Produk berhasil dihapus.');
    }
}
