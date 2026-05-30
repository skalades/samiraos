<?php

namespace App\Providers;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Define Authorization Gates based on UserRole
        Gate::define('manage-users', fn (User $user) => $user->role === UserRole::SuperAdmin);
        Gate::define('manage-products', fn (User $user) => $user->role === UserRole::SuperAdmin);
        Gate::define('manage-announcements', fn (User $user) => $user->role === UserRole::SuperAdmin);
        Gate::define('manage-bank-accounts', fn (User $user) => $user->role === UserRole::SuperAdmin);
        
        Gate::define('view-all-data', fn (User $user) => $user->role === UserRole::SuperAdmin);
        Gate::define('view-central-receivables', fn (User $user) => in_array($user->role, [UserRole::SuperAdmin, UserRole::Distributor]));
        Gate::define('approve-receivable-payments', fn (User $user) => $user->role === UserRole::SuperAdmin);
        Gate::define('order-with-credit', fn (User $user) => $user->role === UserRole::Distributor);
    }
}
