<?php

namespace App\Models;

use App\Enums\StockOpnameType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockOpname extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'system_qty',
        'actual_qty',
        'difference',
        'type',
        'reason',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'system_qty' => 'integer',
            'actual_qty' => 'integer',
            'difference' => 'integer',
            'type' => StockOpnameType::class,
        ];
    }

    // ─── Relationships ────────────────────────────────────────

    /**
     * User yang melakukan stock opname.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Produk yang diopname.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
