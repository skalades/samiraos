<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Enums\OrderStatus;
use App\Enums\ReceivableStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\Territory;
use App\Models\User;
use App\Models\CentralReceivable;
use App\Models\Inventory;
use App\Models\Announcement;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Route user ke dashboard sesuai role.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return match ($user->role) {
            UserRole::SuperAdmin => $this->superAdminDashboard($user),
            UserRole::Distributor => $this->distributorDashboard($user),
            UserRole::Agen => $this->agenDashboard($user),
        };
    }

    /**
     * Dashboard Gudang Pusat (Super Admin).
     */
    private function superAdminDashboard(User $user): Response
    {
        // Statistik utama
        $totalDistributors = User::where('role', UserRole::Distributor)->where('is_active', true)->count();
        $totalAgents = User::where('role', UserRole::Agen)->where('is_active', true)->count();
        $totalProducts = Product::where('is_active', true)->count();

        // Order statistics
        $pendingOrders = Order::where('status', OrderStatus::Pending)->count();
        $todayOrders = Order::whereDate('created_at', today())->count();
        $totalRevenue = Order::where('status', OrderStatus::Delivered)
            ->whereMonth('created_at', now()->month)
            ->sum('total');

        // Piutang nasional
        $totalReceivables = CentralReceivable::whereIn('status', [
            ReceivableStatus::Unpaid,
            ReceivableStatus::PartiallyPaid,
        ])->sum('remaining_balance');

        $overdueCount = CentralReceivable::where('status', ReceivableStatus::Overdue)->count();

        // Territory data untuk peta GeoJSON
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

                return [
                    'id' => $territory->id,
                    'name' => $territory->name,
                    'slug' => $territory->slug,
                    'latitude' => $territory->latitude,
                    'longitude' => $territory->longitude,
                    'max_stock_capacity' => $maxCapacity,
                    'total_stock' => $totalStock,
                    'stock_percentage' => round($percentage, 1),
                    'stock_status' => match (true) {
                        $percentage > 60 => 'aman',
                        $percentage > 20 => 'low',
                        default => 'kritis',
                    },
                    'distributor_name' => $distributor?->user?->name ?? '-',
                    'geojson_feature' => $territory->geojson_feature,
                ];
            });

        // Pengumuman terbaru
        $recentAnnouncements = Announcement::with('publisher')
            ->where('is_active', true)
            ->latest('published_at')
            ->take(5)
            ->get();

        // Activity log terbaru
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
            'territories' => $territories,
            'recentAnnouncements' => $recentAnnouncements,
            'recentLogs' => $recentLogs,
        ]);
    }

    /**
     * Dashboard Distributor Regional.
     */
    private function distributorDashboard(User $user): Response
    {
        $user->load('networkBinding.territory', 'inventory.product');

        $binding = $user->networkBinding;
        $territory = $binding?->territory;

        // Stok gudang regional
        $inventories = $user->inventory->map(function (Inventory $inv) {
            return [
                'id' => $inv->id,
                'product' => $inv->product?->only('id', 'name', 'sku', 'image'),
                'qty' => $inv->qty,
                'low_stock_threshold' => $inv->low_stock_threshold,
                'is_low_stock' => $inv->isLowStock(),
            ];
        });

        // Stok kritis (low stock alerts)
        $lowStockProducts = $inventories->filter(fn($inv) => $inv['is_low_stock']);

        // Info plafon kredit
        $creditInfo = [
            'credit_limit' => $binding?->credit_limit ?? 0,
            'credit_used' => $binding?->credit_used ?? 0,
            'credit_remaining' => ($binding?->credit_limit ?? 0) - ($binding?->credit_used ?? 0),
        ];

        // Order masuk dari agen (pending)
        $pendingAgentOrders = Order::where('seller_id', $user->id)
            ->where('status', OrderStatus::Pending)
            ->with('buyer', 'items.product')
            ->latest()
            ->take(10)
            ->get();

        // Piutang distributor ini
        $receivables = CentralReceivable::where('distributor_id', $user->id)
            ->with('payments')
            ->latest()
            ->take(5)
            ->get();

        // Recent activity logs
        $recentLogs = ActivityLog::where('user_id', $user->id)
            ->latest('created_at')
            ->take(10)
            ->get();

        // Pengumuman untuk distributor
        $announcements = Announcement::where('is_active', true)
            ->where(function ($q) {
                $q->where('target_role', 'all')
                    ->orWhere('target_role', 'distributor');
            })
            ->latest('published_at')
            ->take(5)
            ->get();

        return Inertia::render('Dashboard/Distributor/Index', [
            'territory' => $territory,
            'inventories' => $inventories,
            'lowStockProducts' => $lowStockProducts,
            'creditInfo' => $creditInfo,
            'pendingAgentOrders' => $pendingAgentOrders,
            'receivables' => $receivables,
            'recentLogs' => $recentLogs,
            'announcements' => $announcements,
        ]);
    }

    /**
     * Dashboard Agen Resmi.
     */
    private function agenDashboard(User $user): Response
    {
        $user->load('networkBinding.territory', 'networkBinding.parent', 'inventory.product');

        $binding = $user->networkBinding;

        // Inventori siap jual
        $inventories = $user->inventory->map(function (Inventory $inv) {
            return [
                'id' => $inv->id,
                'product' => $inv->product?->only('id', 'name', 'sku', 'image'),
                'qty' => $inv->qty,
                'low_stock_threshold' => $inv->low_stock_threshold,
                'is_low_stock' => $inv->isLowStock(),
            ];
        });

        // Low stock alerts
        $lowStockProducts = $inventories->filter(fn($inv) => $inv['is_low_stock']);

        // Info distributor induk
        $parentDistributor = $binding?->parent;

        // Riwayat order agen
        $myOrders = Order::where('buyer_id', $user->id)
            ->with('items.product')
            ->latest()
            ->take(10)
            ->get();

        // Pengumuman untuk agen
        $announcements = Announcement::where('is_active', true)
            ->where(function ($q) {
                $q->where('target_role', 'all')
                    ->orWhere('target_role', 'agen');
            })
            ->latest('published_at')
            ->take(5)
            ->get();

        // Produk yang tersedia untuk dipesan (dari distributor)
        $availableProducts = [];
        if ($parentDistributor) {
            $availableProducts = Inventory::where('user_id', $parentDistributor->id)
                ->with('product.prices')
                ->where('qty', '>', 0)
                ->get()
                ->map(function (Inventory $inv) {
                    $agenPrice = $inv->product->prices
                        ->where('tier', 'agen')
                        ->first();

                    return [
                        'product' => $inv->product->only('id', 'name', 'sku', 'image'),
                        'available_qty' => $inv->qty,
                        'price' => $agenPrice?->price ?? 0,
                    ];
                });
        }

        return Inertia::render('Dashboard/Agen/Index', [
            'territory' => $binding?->territory,
            'parentDistributor' => $parentDistributor?->only('id', 'name', 'phone', 'address'),
            'inventories' => $inventories,
            'lowStockProducts' => $lowStockProducts,
            'myOrders' => $myOrders,
            'announcements' => $announcements,
            'availableProducts' => $availableProducts,
        ]);
    }
}
