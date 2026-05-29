<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'qty',
        'low_stock_threshold',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'qty' => 'integer',
            'low_stock_threshold' => 'integer',
        ];
    }

    // ─── Relationships ────────────────────────────────────────

    /**
     * User pemilik stok ini.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Produk yang distok.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // ─── Helpers ──────────────────────────────────────────────

    /**
     * Cek apakah stok di bawah threshold.
     */
    public function isLowStock(): bool
    {
        return $this->qty <= ($this->low_stock_threshold ?? 0);
    }

    /**
     * Hitung persentase stok terhadap kapasitas maksimum.
     */
    public function getStockPercentage(int $maxCapacity): float
    {
        if ($maxCapacity <= 0) {
            return 0.0;
        }

        return round(($this->qty / $maxCapacity) * 100, 2);
    }
}
