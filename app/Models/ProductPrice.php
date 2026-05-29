<?php

namespace App\Models;

use App\Enums\PriceTier;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductPrice extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'tier',
        'price',
        'min_qty',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tier' => PriceTier::class,
            'price' => 'float',
            'min_qty' => 'integer',
        ];
    }

    // ─── Relationships ────────────────────────────────────────

    /**
     * Produk yang memiliki harga ini.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
