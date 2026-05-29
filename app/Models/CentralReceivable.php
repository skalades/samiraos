<?php

namespace App\Models;

use App\Enums\ReceivableStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CentralReceivable extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'distributor_id',
        'invoice_number',
        'total_invoice',
        'amount_paid',
        'remaining_balance',
        'due_date',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total_invoice' => 'float',
            'amount_paid' => 'float',
            'remaining_balance' => 'float',
            'due_date' => 'date',
            'status' => ReceivableStatus::class,
        ];
    }

    // ─── Boot: Auto-generate Invoice Number ───────────────────

    protected static function booted(): void
    {
        static::creating(function (CentralReceivable $receivable) {
            if (empty($receivable->invoice_number)) {
                $receivable->invoice_number = static::generateInvoiceNumber();
            }
        });
    }

    /**
     * Generate nomor invoice unik: INV-YYYYMMDD-XXXXX
     */
    public static function generateInvoiceNumber(): string
    {
        $date = now()->format('Ymd');
        $random = str_pad((string) random_int(0, 99999), 5, '0', STR_PAD_LEFT);

        $invoiceNumber = "INV-{$date}-{$random}";

        // Pastikan unique, retry jika collision
        while (static::where('invoice_number', $invoiceNumber)->exists()) {
            $random = str_pad((string) random_int(0, 99999), 5, '0', STR_PAD_LEFT);
            $invoiceNumber = "INV-{$date}-{$random}";
        }

        return $invoiceNumber;
    }

    // ─── Relationships ────────────────────────────────────────

    /**
     * Order yang terkait piutang ini.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Distributor yang punya piutang.
     */
    public function distributor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'distributor_id');
    }

    /**
     * Pembayaran yang sudah masuk untuk piutang ini.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(ReceivablePayment::class, 'receivable_id');
    }

    // ─── Helpers ──────────────────────────────────────────────

    /**
     * Cek apakah piutang sudah jatuh tempo.
     */
    public function isOverdue(): bool
    {
        return $this->due_date !== null
            && $this->due_date->isPast()
            && $this->status !== ReceivableStatus::PAID;
    }

    /**
     * Persentase yang sudah dibayar.
     */
    public function paidPercentage(): float
    {
        if ($this->total_invoice <= 0) {
            return 0.0;
        }

        return round(($this->amount_paid / $this->total_invoice) * 100, 2);
    }
}
