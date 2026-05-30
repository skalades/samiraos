<?php

namespace App\Services;

use App\Contracts\Services\InventoryServiceInterface;
use App\Enums\StockOpnameType;
use App\Models\Inventory;
use App\Models\StockOpname;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class InventoryService implements InventoryServiceInterface
{
    public function __construct(
        private readonly AuditService $auditService,
    ) {}

    /**
     * Tambah stok untuk user tertentu.
     * Jika record inventory belum ada, akan dibuat otomatis.
     *
     * @param  User   $user
     * @param  int    $productId
     * @param  int    $qty       Jumlah yang ditambahkan (harus positif)
     * @param  string $reason    Alasan penambahan stok
     * @return Inventory
     *
     * @throws RuntimeException
     */
    public function addStock(User $user, int $productId, int $qty, string $reason): Inventory
    {
        if ($qty <= 0) {
            throw new RuntimeException('Jumlah stok yang ditambahkan harus lebih dari 0.');
        }

        return DB::transaction(function () use ($user, $productId, $qty, $reason) {
            $inventory = Inventory::lockForUpdate()
                ->firstOrCreate(
                    ['user_id' => $user->id, 'product_id' => $productId],
                    ['qty' => 0, 'low_stock_threshold' => 10]
                );

            $oldQty = $inventory->qty;
            $inventory->increment('qty', $qty);
            $inventory->refresh();

            $this->auditService->log(
                user: $user,
                actionType: \App\Enums\AuditAction::AddStock,
                description: "{$reason} (+{$qty})",
                entity: $inventory,
                oldValues: ['qty' => $oldQty],
                newValues: ['qty' => $inventory->qty]
            );

            return $inventory;
        });
    }

    /**
     * Kurangi stok untuk user tertentu.
     *
     * @param  User   $user
     * @param  int    $productId
     * @param  int    $qty       Jumlah yang dikurangi (harus positif)
     * @param  string $reason    Alasan pengurangan stok
     * @return Inventory
     *
     * @throws RuntimeException
     */
    public function deductStock(User $user, int $productId, int $qty, string $reason): Inventory
    {
        if ($qty <= 0) {
            throw new RuntimeException('Jumlah stok yang dikurangi harus lebih dari 0.');
        }

        return DB::transaction(function () use ($user, $productId, $qty, $reason) {
            $inventory = Inventory::lockForUpdate()
                ->where('user_id', $user->id)
                ->where('product_id', $productId)
                ->first();

            if (! $inventory) {
                throw new RuntimeException("Stok produk #{$productId} tidak ditemukan untuk user {$user->name}.");
            }

            if ($inventory->qty < $qty) {
                throw new RuntimeException(
                    "Stok tidak cukup. Tersedia: {$inventory->qty}, Dibutuhkan: {$qty}"
                );
            }

            $oldQty = $inventory->qty;
            $inventory->decrement('qty', $qty);
            $inventory->refresh();

            $this->auditService->log(
                user: $user,
                actionType: \App\Enums\AuditAction::DeductStock,
                description: "{$reason} (-{$qty})",
                entity: $inventory,
                oldValues: ['qty' => $oldQty],
                newValues: ['qty' => $inventory->qty]
            );

            return $inventory;
        });
    }

    /**
     * Ambil level stok saat ini.
     *
     * @param  User $user
     * @param  int  $productId
     * @return int
     */
    public function getStockLevel(User $user, int $productId): int
    {
        $inventory = Inventory::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->first();

        return $inventory?->qty ?? 0;
    }

    /**
     * Ambil produk-produk yang stoknya di bawah threshold.
     *
     * @param  User $user
     * @return Collection<int, Inventory>
     */
    public function getLowStockProducts(User $user): Collection
    {
        return Inventory::with('product')
            ->where('user_id', $user->id)
            ->whereColumn('qty', '<=', 'low_stock_threshold')
            ->get();
    }

    /**
     * Lakukan stock opname: bandingkan stok sistem vs aktual.
     * Otomatis menyesuaikan stok sistem ke aktual.
     *
     * @param  User   $user
     * @param  int    $productId
     * @param  int    $actualQty Jumlah stok aktual di lapangan
     * @param  string $reason    Alasan / catatan opname
     * @return StockOpname
     */
    public function performOpname(User $user, int $productId, int $actualQty, string $reason): StockOpname
    {
        return DB::transaction(function () use ($user, $productId, $actualQty, $reason) {
            $inventory = Inventory::lockForUpdate()
                ->firstOrCreate(
                    ['user_id' => $user->id, 'product_id' => $productId],
                    ['qty' => 0, 'low_stock_threshold' => 10]
                );

            $systemQty = $inventory->qty;
            $difference = $actualQty - $systemQty;

            // Tentukan tipe opname
            $type = match (true) {
                $difference > 0 => StockOpnameType::SURPLUS,
                $difference < 0 => StockOpnameType::DEFICIT,
                default => StockOpnameType::MATCH,
            };

            // Catat opname
            $opname = StockOpname::create([
                'user_id' => $user->id,
                'product_id' => $productId,
                'system_qty' => $systemQty,
                'actual_qty' => $actualQty,
                'difference' => $difference,
                'type' => $type,
                'reason' => $reason,
            ]);

            // Sesuaikan stok sistem ke aktual
            if ($difference !== 0) {
                $inventory->update(['qty' => $actualQty]);
            }

            $this->auditService->log(
                user: $user,
                actionType: \App\Enums\AuditAction::StockOpname,
                description: "Stock opname: sistem={$systemQty}, aktual={$actualQty}, selisih={$difference}. {$reason}",
                entity: $opname,
                oldValues: ['qty' => $systemQty],
                newValues: ['qty' => $actualQty, 'difference' => $difference, 'type' => $type->value]
            );

            return $opname;
        });
    }
}
