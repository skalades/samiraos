<?php

namespace App\Contracts\Services;

use App\Models\Inventory;
use App\Models\StockOpname;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface InventoryServiceInterface
{
    public function addStock(User $user, int $productId, int $qty, string $reason): Inventory;
    public function deductStock(User $user, int $productId, int $qty, string $reason): Inventory;
    public function getStockLevel(User $user, int $productId): int;
    public function getLowStockProducts(User $user): Collection;
    public function performOpname(User $user, int $productId, int $actualQty, string $reason): StockOpname;
}
