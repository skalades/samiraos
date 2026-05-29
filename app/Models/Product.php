<?php

namespace App\Models;

use App\Enums\PriceTier;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'sku',
        'description',
        'unit',
        'weight_grams',
        'image',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'weight_grams' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    // ─── Relationships ────────────────────────────────────────

    /**
     * Daftar harga per tier untuk produk ini.
     */
    public function prices(): HasMany
    {
        return $this->hasMany(ProductPrice::class);
    }

    /**
     * Order items yang berisi produk ini.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Inventori produk di semua user.
     */
    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }

    // ─── Helpers ──────────────────────────────────────────────

    /**
     * Ambil harga produk berdasarkan tier distribusi.
     * Return null jika tier tidak ditemukan.
     */
    public function getPriceForTier(PriceTier $tier): ?float
    {
        $price = $this->prices()
            ->where('tier', $tier->value)
            ->first();

        return $price?->price;
    }

    /**
     * Ambil harga produk berdasarkan tier dan quantity (untuk min_qty tiering).
     */
    public function getPriceForTierAndQty(PriceTier $tier, int $qty): ?float
    {
        $price = $this->prices()
            ->where('tier', $tier->value)
            ->where('min_qty', '<=', $qty)
            ->orderByDesc('min_qty')
            ->first();

        return $price?->price;
    }
}
