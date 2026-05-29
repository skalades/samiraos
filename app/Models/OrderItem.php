<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'qty',
        'unit_price',
        'subtotal',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'qty' => 'integer',
            'unit_price' => 'float',
            'subtotal' => 'float',
        ];
    }

    // ─── Relationships ────────────────────────────────────────

    /**
     * Order induk dari item ini.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Produk yang dipesan.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
