<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use Illuminate\Http\Request;
use Inertia\Response;
use App\Services\Dashboard\SuperAdminDashboardService;
use App\Services\Dashboard\DistributorDashboardService;
use App\Services\Dashboard\AgenDashboardService;

class DashboardController extends Controller
{
    /**
     * Route user ke dashboard sesuai role.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return match ($user->role) {
            UserRole::SuperAdmin => app(SuperAdminDashboardService::class)->getDashboard($user),
            UserRole::Distributor => app(DistributorDashboardService::class)->getDashboard($user),
            UserRole::Agen => app(AgenDashboardService::class)->getDashboard($user),
        };
    }
}
