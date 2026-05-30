<?php

namespace App\Services\Dashboard;

use App\Contracts\Services\DashboardServiceInterface;
use App\Models\Announcement;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\User;
use App\Http\Resources\TerritoryResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\AnnouncementResource;
use App\Http\Resources\InventoryResource;
use App\Http\Resources\ProductResource;
use Inertia\Inertia;
use Inertia\Response;

class AgenDashboardService implements DashboardServiceInterface
{
    public function getDashboard(User $user): Response
    {
        $user->load('networkBinding.territory', 'networkBinding.parent', 'inventory.product');

        $binding = $user->networkBinding;
        
        $inventories = collect();
        if ($user->relationLoaded('inventory')) {
            $inventories = $user->inventory;
        }

        $lowStockProducts = $inventories->filter(fn(Inventory $inv) => $inv->isLowStock());

        $parentDistributor = $binding?->parent;

        $myOrders = Order::where('buyer_id', $user->id)
            ->with('items.product')
            ->latest()
            ->take(10)
            ->get();

        $announcements = Announcement::active()
            ->forRole('agen')
            ->latest('published_at')
            ->take(5)
            ->get();

        $availableProducts = collect();
        if ($parentDistributor) {
            $availableProducts = Inventory::where('user_id', $parentDistributor->id)
                ->with('product.prices')
                ->where('qty', '>', 0)
                ->get()
                ->map(function (Inventory $inv) {
                    $agenPrice = clone $inv->product;
                    if ($agenPrice->relationLoaded('prices')) {
                        $priceModel = $agenPrice->prices->where('tier', 'agen')->first();
                        $agenPrice->current_price = $priceModel?->price ?? 0;
                    }

                    return [
                        'product' => new ProductResource($agenPrice),
                        'available_qty' => $inv->qty,
                        'price' => $agenPrice->current_price ?? 0,
                    ];
                });
        }

        return Inertia::render('Dashboard/Agen/Index', [
            'territory' => $binding?->territory ? new TerritoryResource($binding->territory) : null,
            'parentDistributor' => $parentDistributor?->only('id', 'name', 'phone', 'address'),
            'inventories' => InventoryResource::collection($inventories),
            'lowStockProducts' => InventoryResource::collection($lowStockProducts),
            'myOrders' => OrderResource::collection($myOrders),
            'announcements' => AnnouncementResource::collection($announcements),
            'availableProducts' => $availableProducts,
        ]);
    }
}
