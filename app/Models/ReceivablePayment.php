<?php

namespace App\Models;

use App\Enums\PaymentVerificationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReceivablePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'receivable_id',
        'amount',
        'payment_proof',
        'bank_name',
        'account_number',
        'transfer_date',
        'status',
        'verified_by',
        'verified_at',
        'rejection_reason',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'transfer_date' => 'date',
            'status' => PaymentVerificationStatus::class,
            'verified_at' => 'datetime',
        ];
    }

    // ─── Relationships ────────────────────────────────────────

    /**
     * Piutang induk yang dibayar.
     */
    public function receivable(): BelongsTo
    {
        return $this->belongsTo(CentralReceivable::class, 'receivable_id');
    }

    /**
     * Admin yang memverifikasi pembayaran.
     */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    // ─── Helpers ──────────────────────────────────────────────

    /**
     * Apakah pembayaran ini sudah diverifikasi (approved/rejected).
     */
    public function isVerified(): bool
    {
        return $this->status !== PaymentVerificationStatus::PENDING_VERIFICATION;
    }

    /**
     * Apakah pembayaran ini disetujui.
     */
    public function isApproved(): bool
    {
        return $this->status === PaymentVerificationStatus::APPROVED;
    }
}
