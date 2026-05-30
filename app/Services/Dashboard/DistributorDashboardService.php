<?php

namespace App\Services\Dashboard;

use App\Contracts\Services\DashboardServiceInterface;
use App\Enums\OrderStatus;
use App\Models\ActivityLog;
use App\Models\Announcement;
use App\Models\CentralReceivable;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\User;
use App\Http\Resources\TerritoryResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\CentralReceivableResource;
use App\Http\Resources\ActivityLogResource;
use App\Http\Resources\AnnouncementResource;
use App\Http\Resources\InventoryResource;
use Inertia\Inertia;
use Inertia\Response;

class DistributorDashboardService implements DashboardServiceInterface
{
    public function getDashboard(User $user): Response
    {
        $user->load('networkBinding.territory', 'inventory.product');

        $binding = $user->networkBinding;
        $territory = $binding?->territory;

        $inventories = collect();
        if ($user->relationLoaded('inventory')) {
            $inventories = $user->inventory;
        }

        $lowStockProducts = $inventories->filter(fn(Inventory $inv) => $inv->isLowStock());

        $creditInfo = $user->getCreditInfo();

        $pendingAgentOrders = Order::where('seller_id', $user->id)
            ->where('status', OrderStatus::Pending)
            ->with('buyer', 'items.product')
            ->latest()
            ->take(10)
            ->get();

        $receivables = CentralReceivable::where('distributor_id', $user->id)
            ->with('payments')
            ->latest()
            ->take(5)
            ->get();

        $recentLogs = ActivityLog::where('user_id', $user->id)
            ->latest('created_at')
            ->take(10)
            ->get();

        $announcements = Announcement::active()
            ->forRole('distributor')
            ->latest('published_at')
            ->take(5)
            ->get();

        return Inertia::render('Dashboard/Distributor/Index', [
            'territory' => $territory ? new TerritoryResource($territory) : null,
            'inventories' => InventoryResource::collection($inventories),
            'lowStockProducts' => InventoryResource::collection($lowStockProducts),
            'creditInfo' => $creditInfo,
            'pendingAgentOrders' => OrderResource::collection($pendingAgentOrders),
            'receivables' => CentralReceivableResource::collection($receivables),
            'recentLogs' => ActivityLogResource::collection($recentLogs),
            'announcements' => AnnouncementResource::collection($announcements),
        ]);
    }
}
