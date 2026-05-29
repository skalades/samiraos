<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Enums\ReceivableStatus;
use App\Models\CentralReceivable;
use App\Models\ReceivablePayment;
use App\Services\ReceivableService;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReceivableController extends Controller
{
    public function __construct(
        private readonly ReceivableService $receivableService,
        private readonly AuditService $auditService,
    ) {}

    /**
     * Daftar piutang (Super Admin: semua, Distributor: milik sendiri).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = CentralReceivable::with(['distributor', 'order', 'payments']);

        if ($user->role === UserRole::Distributor) {
            $query->where('distributor_id', $user->id);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $receivables = $query->latest()->paginate(15)->withQueryString();

        // Ringkasan
        $summary = [
            'total_unpaid' => CentralReceivable::when(
                $user->role === UserRole::Distributor,
                fn($q) => $q->where('distributor_id', $user->id)
            )->whereIn('status', [ReceivableStatus::Unpaid, ReceivableStatus::PartiallyPaid])
                ->sum('remaining_balance'),
            'total_overdue' => CentralReceivable::when(
                $user->role === UserRole::Distributor,
                fn($q) => $q->where('distributor_id', $user->id)
            )->where('status', ReceivableStatus::Overdue)
                ->count(),
        ];

        return Inertia::render('Receivables/Index', [
            'receivables' => $receivables,
            'summary' => $summary,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Detail piutang.
     */
    public function show(Request $request, CentralReceivable $receivable): Response
    {
        $user = $request->user();

        if ($user->role === UserRole::Distributor && $receivable->distributor_id !== $user->id) {
            abort(403);
        }

        $receivable->load(['distributor', 'order.items.product', 'payments.verifier']);

        return Inertia::render('Receivables/Show', [
            'receivable' => $receivable,
        ]);
    }

    /**
     * Submit pembayaran cicilan (Distributor).
     */
    public function submitPayment(Request $request, CentralReceivable $receivable): RedirectResponse
    {
        if ($request->user()->role !== UserRole::Distributor) {
            abort(403);
        }

        if ($receivable->distributor_id !== $request->user()->id) {
            abort(403);
        }

        $request->validate([
            'amount' => 'required|numeric|min:1000|max:' . $receivable->remaining_balance,
            'payment_proof' => 'required|image|mimes:jpg,jpeg,png|max:5120',
            'bank_name' => 'nullable|string|max:100',
            'account_number' => 'nullable|string|max:50',
            'transfer_date' => 'required|date',
        ]);

        try {
            // Upload bukti transfer
            $proofPath = $request->file('payment_proof')->store('payment-proofs', 'public');

            $payment = $this->receivableService->submitPayment($receivable, [
                'amount' => $request->amount,
                'payment_proof' => $proofPath,
                'bank_name' => $request->bank_name,
                'account_number' => $request->account_number,
                'transfer_date' => $request->transfer_date,
            ]);

            $this->auditService->log(
                user: $request->user(),
                actionType: 'SUBMIT_PAYMENT',
                description: "Mengunggah bukti transfer untuk faktur #{$receivable->invoice_number} sebesar Rp " . number_format($request->amount, 0, ',', '.'),
                entity: $payment,
            );

            return back()->with('success', 'Bukti pembayaran berhasil diunggah. Menunggu verifikasi Admin Pusat.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Approve pembayaran (Super Admin).
     */
    public function approvePayment(Request $request, ReceivablePayment $payment): RedirectResponse
    {
        if ($request->user()->role !== UserRole::SuperAdmin) {
            abort(403);
        }

        try {
            $this->receivableService->approvePayment($payment, $request->user());

            $receivable = $payment->receivable;

            $this->auditService->log(
                user: $request->user(),
                actionType: 'APPROVE_PAYMENT',
                description: "Memverifikasi pembayaran untuk faktur #{$receivable->invoice_number} sebesar Rp " . number_format($payment->amount, 0, ',', '.'),
                entity: $payment,
            );

            return back()->with('success', 'Pembayaran disetujui. Plafon kredit distributor telah dipulihkan.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Reject pembayaran (Super Admin).
     */
    public function rejectPayment(Request $request, ReceivablePayment $payment): RedirectResponse
    {
        if ($request->user()->role !== UserRole::SuperAdmin) {
            abort(403);
        }

        $request->validate(['reason' => 'required|string|max:500']);

        try {
            $this->receivableService->rejectPayment($payment, $request->user(), $request->reason);

            $this->auditService->log(
                user: $request->user(),
                actionType: 'REJECT_PAYMENT',
                description: "Menolak pembayaran faktur #{$payment->receivable->invoice_number}: {$request->reason}",
                entity: $payment,
            );

            return back()->with('success', 'Pembayaran ditolak. Distributor akan diminta mengunggah ulang bukti transfer.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
