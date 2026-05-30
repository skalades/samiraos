<?php

namespace App\Contracts\Services;

use App\Models\User;
use Inertia\Response;

interface DashboardServiceInterface
{
    /**
     * Get the dashboard view and data for the given user.
     */
    public function getDashboard(User $user): Response;
}
