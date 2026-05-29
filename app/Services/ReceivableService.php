<?php

namespace App\Services;

use App\Enums\PaymentVerificationStatus;
use App\Enums\ReceivableStatus;
use App\Models\CentralReceivable;
use App\Models\Order;
use App\Models\ReceivablePayment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ReceivableService
{
    public function __construct(
        private readonly AuditService $auditService,
    ) {}

    /**
     * Buat record piutang untuk order tempo.
     * Due date default: 30 hari dari sekarang.
     *
     * @param  Order $order
     * @param  int   $dueDays Jumlah hari jatuh tempo (default: 30)
     * @return CentralReceivable
     */
    public function createReceivable(Order $order, int $dueDays = 30): CentralReceivable
    {
        return DB::transaction(function () use ($order, $dueDays) {
            $receivable = CentralReceivable::create([
                'order_id' => $order->id,
                'distributor_id' => $order->buyer_id,
                'total_invoice' => $order->total,
                'amount_paid' => 0,
                'remaining_balance' => $order->total,
                'due_date' => now()->addDays($dueDays),
                'status' => ReceivableStatus::Unpaid,
            ]);

            $this->auditService->log(
                user: $order->buyer,
                actionType: 'receivable_created',
                description: "Piutang {$receivable->invoice_number} dibuat untuk order {$order->order_number}",
                entity: $receivable,
                newValues: $receivable->toArray()
            );

            return $receivable;
        });
    }

    /**
     * Submit bukti pembayaran piutang.
     *
     * @param  CentralReceivable $receivable
     * @param  array{
     *     amount: float,
     *     payment_proof: string,
     *     bank_name: string,
     *     account_number: string,
     *     transfer_date: string
     * } $data
     * @return ReceivablePayment
     */
    public function submitPayment(CentralReceivable $receivable, array $data): ReceivablePayment
    {
        if ($receivable->status === ReceivableStatus::Paid) {
            throw new RuntimeException("Piutang {$receivable->invoice_number} sudah lunas.");
        }

        return DB::transaction(function () use ($receivable, $data) {
            $payment = ReceivablePayment::create([
                'receivable_id' => $receivable->id,
                'amount' => $data['amount'],
                'payment_proof' => $data['payment_proof'],
                'bank_name' => $data['bank_name'],
                'account_number' => $data['account_number'],
                'transfer_date' => $data['transfer_date'],
                'status' => PaymentVerificationStatus::PendingVerification,
            ]);

            $this->auditService->log(
                user: $receivable->distributor,
                actionType: 'payment_submitted',
                description: "Pembayaran Rp " . number_format($data['amount'], 0, ',', '.') .
                    " disubmit untuk piutang {$receivable->invoice_number}",
                entity: $payment,
                newValues: $payment->toArray()
            );

            return $payment;
        });
    }

    /**
     * Approve bukti pembayaran (verifikasi oleh admin).
     *
     * Flow:
     * - Update payment status → approved
     * - Update receivable: amount_paid += amount, remaining_balance -= amount
     * - Jika remaining_balance <= 0 → status = paid
     * - Else → status = partially_paid
     * - Kurangi credit_used pada network_binding
     *
     * @param  ReceivablePayment $payment
     * @param  User              $admin
     * @return ReceivablePayment
     */
    public function approvePayment(ReceivablePayment $payment, User $admin): ReceivablePayment
    {
        if ($payment->status !== PaymentVerificationStatus::PendingVerification) {
            throw new RuntimeException('Pembayaran ini sudah diverifikasi.');
        }

        return DB::transaction(function () use ($payment, $admin) {
            $oldPaymentValues = $payment->toArray();

            // Update payment status
            $payment->update([
                'status' => PaymentVerificationStatus::Approved,
                'verified_by' => $admin->id,
                'verified_at' => now(),
            ]);

            // Update receivable
            $receivable = $payment->receivable()->lockForUpdate()->first();
            $oldReceivableValues = $receivable->toArray();

            $receivable->amount_paid += $payment->amount;
            $receivable->remaining_balance -= $payment->amount;

            // Pastikan tidak negatif
            if ($receivable->remaining_balance <= 0) {
                $receivable->remaining_balance = 0;
                $receivable->status = ReceivableStatus::Paid;
            } else {
                $receivable->status = ReceivableStatus::PartiallyPaid;
            }

            $receivable->save();

            // Kembalikan credit: kurangi credit_used
            $distributor = $receivable->distributor;
            if ($distributor->networkBinding) {
                $distributor->networkBinding->decrement('credit_used', $payment->amount);

                // Pastikan credit_used tidak negatif
                if ($distributor->networkBinding->credit_used < 0) {
                    $distributor->networkBinding->update(['credit_used' => 0]);
                }
            }

            $this->auditService->log(
                user: $admin,
                actionType: 'payment_approved',
                description: "Pembayaran Rp " . number_format($payment->amount, 0, ',', '.') .
                    " disetujui untuk piutang {$receivable->invoice_number}",
                entity: $payment,
                oldValues: $oldPaymentValues,
                newValues: $payment->fresh()->toArray()
            );

            return $payment->fresh(['receivable']);
        });
    }

    /**
     * Reject bukti pembayaran dengan alasan.
     *
     * @param  ReceivablePayment $payment
     * @param  User              $admin
     * @param  string            $reason
     * @return ReceivablePayment
     */
    public function rejectPayment(ReceivablePayment $payment, User $admin, string $reason): ReceivablePayment
    {
        if ($payment->status !== PaymentVerificationStatus::PendingVerification) {
            throw new RuntimeException('Pembayaran ini sudah diverifikasi.');
        }

        return DB::transaction(function () use ($payment, $admin, $reason) {
            $oldValues = $payment->toArray();

            $payment->update([
                'status' => PaymentVerificationStatus::Rejected,
                'verified_by' => $admin->id,
                'verified_at' => now(),
                'rejection_reason' => $reason,
            ]);

            $this->auditService->log(
                user: $admin,
                actionType: 'payment_rejected',
                description: "Pembayaran ditolak untuk piutang {$payment->receivable->invoice_number}: {$reason}",
                entity: $payment,
                oldValues: $oldValues,
                newValues: $payment->fresh()->toArray()
            );

            return $payment->fresh(['receivable']);
        });
    }

    /**
     * Cek dan tandai piutang yang sudah jatuh tempo.
     * Untuk dijalankan via scheduled job.
     */
    public function checkOverdueReceivables(): void
    {
        $overdueReceivables = CentralReceivable::where('due_date', '<', now())
            ->whereNotIn('status', [
                ReceivableStatus::Paid->value,
                ReceivableStatus::Overdue->value,
            ])
            ->get();

        foreach ($overdueReceivables as $receivable) {
            DB::transaction(function () use ($receivable) {
                $oldValues = $receivable->toArray();

                $receivable->update(['status' => ReceivableStatus::Overdue]);

                $this->auditService->log(
                    user: $receivable->distributor,
                    actionType: 'receivable_overdue',
                    description: "Piutang {$receivable->invoice_number} jatuh tempo",
                    entity: $receivable,
                    oldValues: $oldValues,
                    newValues: $receivable->fresh()->toArray()
                );
            });
        }
    }
}
