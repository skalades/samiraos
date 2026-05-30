<?php

namespace App\Services\Dashboard;

use App\Contracts\Services\DashboardServiceInterface;
use App\Enums\OrderStatus;
use App\Enums\ReceivableStatus;
use App\Enums\UserRole;
use App\Models\ActivityLog;
use App\Models\Announcement;
use App\Models\CentralReceivable;
use App\Models\Order;
use App\Models\Product;
use App\Models\Territory;
use App\Models\User;
use App\Http\Resources\TerritoryResource;
use App\Http\Resources\AnnouncementResource;
use App\Http\Resources\ActivityLogResource;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminDashboardService implements DashboardServiceInterface
{
    public function getDashboard(User $user): Response
    {
        $totalDistributors = User::where('role', UserRole::Distributor)->where('is_active', true)->count();
        $totalAgents = User::where('role', UserRole::Agen)->where('is_active', true)->count();
        $totalProducts = Product::where('is_active', true)->count();

        $pendingOrders = Order::where('status', OrderStatus::Pending)->count();
        $todayOrders = Order::whereDate('created_at', today())->count();
        $totalRevenue = Order::where('status', OrderStatus::Delivered)
            ->whereMonth('created_at', now()->month)
            ->sum('total');

        $totalReceivables = CentralReceivable::whereIn('status', [
            ReceivableStatus::Unpaid,
            ReceivableStatus::PartiallyPaid,
        ])->sum('remaining_balance');

        $overdueCount = CentralReceivable::where('status', ReceivableStatus::Overdue)->count();

        $territories = Territory::with(['networkBindings.user.inventory'])
            ->where('is_active', true)
            ->get()
            ->map(function (Territory $territory) {
                $distributor = $territory->networkBindings
                    ->where('role', 'distributor')
                    ->first();

                $totalStock = 0;
                $maxCapacity = $territory->max_stock_capacity;

                if ($distributor && $distributor->user) {
                    $totalStock = $distributor->user->inventory->sum('qty');
                }

                $percentage = $maxCapacity > 0 ? ($totalStock / $maxCapacity) * 100 : 0;
                
                $territory->total_stock = $totalStock;
                $territory->stock_percentage = round($percentage, 1);
                $territory->stock_status = match (true) {
                    $percentage > 60 => 'aman',
                    $percentage > 20 => 'low',
                    default => 'kritis',
                };
                $territory->distributor_name = $distributor?->user?->name ?? '-';
                
                return $territory;
            });

        $recentAnnouncements = Announcement::with('publisher')
            ->where('is_active', true)
            ->latest('published_at')
            ->take(5)
            ->get();

        $recentLogs = ActivityLog::with('user')
            ->latest('created_at')
            ->take(10)
            ->get();

        return Inertia::render('Dashboard/SuperAdmin/Index', [
            'stats' => [
                'totalDistributors' => $totalDistributors,
                'totalAgents' => $totalAgents,
                'totalProducts' => $totalProducts,
                'pendingOrders' => $pendingOrders,
                'todayOrders' => $todayOrders,
                'totalRevenue' => $totalRevenue,
                'totalReceivables' => $totalReceivables,
                'overdueCount' => $overdueCount,
            ],
            'territories' => $territories->map(fn($t) => array_merge(
                (new TerritoryResource($t))->resolve(), 
                [
                    'total_stock' => $t->total_stock,
                    'stock_percentage' => $t->stock_percentage,
                    'stock_status' => $t->stock_status,
                    'distributor_name' => $t->distributor_name,
                ]
            )),
            'recentAnnouncements' => AnnouncementResource::collection($recentAnnouncements),
            'recentLogs' => ActivityLogResource::collection($recentLogs),
        ]);
    }
}
