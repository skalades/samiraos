<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class ServiceLayerProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Contracts\Services\InventoryServiceInterface::class,
            \App\Services\InventoryService::class
        );

        $this->app->bind(
            \App\Contracts\Services\OrderCreationServiceInterface::class,
            \App\Services\OrderCreationService::class
        );

        $this->app->bind(
            \App\Contracts\Services\ReceivableServiceInterface::class,
            \App\Services\ReceivableService::class
        );
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
