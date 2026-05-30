<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_number',
        'type',
        'buyer_id',
        'seller_id',
        'payment_type',
        'status',
        'subtotal',
        'discount',
        'total',
        'notes',
        'rejection_reason',
        'shipped_at',
        'delivered_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => OrderType::class,
            'payment_type' => PaymentType::class,
            'status' => OrderStatus::class,
            'subtotal' => 'float',
            'discount' => 'float',
            'total' => 'float',
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    // ─── Boot: Auto-generate Order Number ─────────────────────

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            if (empty($order->order_number)) {
                $order->order_number = static::generateOrderNumber();
            }
        });
    }

    /**
     * Generate nomor order unik berurutan: PO/YYYY/MM/XXXX
     */
    public static function generateOrderNumber(): string
    {
        return \App\Services\SequenceService::generate('PO');
    }

    // ─── Relationships ────────────────────────────────────────

    /**
     * Pembeli (agen atau distributor).
     */
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    /**
     * Penjual (distributor untuk agen, null/pusat untuk distributor).
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Item-item dalam order ini.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Piutang yang terkait order tempo ini.
     */
    public function receivable(): HasOne
    {
        return $this->hasOne(CentralReceivable::class);
    }

    // ─── Helpers ──────────────────────────────────────────────

    /**
     * Apakah order ini bisa diapprove.
     */
    public function canBeApproved(): bool
    {
        return $this->status === OrderStatus::Pending;
    }

    /**
     * Apakah order ini bisa dikirim.
     */
    public function canBeShipped(): bool
    {
        return $this->status === OrderStatus::Approved;
    }

    /**
     * Apakah order ini bisa di-deliver.
     */
    public function canBeDelivered(): bool
    {
        return $this->status === OrderStatus::Shipped;
    }

    /**
     * Apakah order ini bisa dibatalkan.
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, [OrderStatus::Pending, OrderStatus::Approved]);
    }

    /**
     * Apakah order ini menggunakan pembayaran tempo.
     */
    public function isTempo(): bool
    {
        return $this->payment_type === PaymentType::Tempo;
    }
}
