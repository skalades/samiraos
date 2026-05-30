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
use App\Http\Requests\SubmitPaymentRequest;
use Illuminate\Support\Facades\Gate;

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

        Gate::authorize('view-central-receivables');

        if (! $user->can('view-all-data')) {
            $query->where('distributor_id', $user->id);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $receivables = $query->latest()->paginate(15)->withQueryString();

        // Ringkasan
        $summary = [
            'total_unpaid' => CentralReceivable::when(
                ! $user->can('view-all-data'),
                fn($q) => $q->where('distributor_id', $user->id)
            )->whereIn('status', [ReceivableStatus::Unpaid, ReceivableStatus::PartiallyPaid])
                ->sum('remaining_balance'),
            'total_overdue' => CentralReceivable::when(
                ! $user->can('view-all-data'),
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

        Gate::authorize('view-central-receivables');

        if (! $user->can('view-all-data') && $receivable->distributor_id !== $user->id) {
            abort(403);
        }

        $receivable->load(['distributor', 'order.items.product', 'payments.verifier']);
        $bankAccounts = \App\Models\BankAccount::where('is_active', true)->get();

        return Inertia::render('Receivables/Show', [
            'receivable' => $receivable,
            'bankAccounts' => $bankAccounts,
        ]);
    }

    /**
     * Submit pembayaran cicilan (Distributor).
     */
    public function submitPayment(SubmitPaymentRequest $request, CentralReceivable $receivable): RedirectResponse
    {
        if ($request->user()->can('view-all-data')) {
            abort(403); // SuperAdmin cannot submit payment
        }

        if ($receivable->distributor_id !== $request->user()->id) {
            abort(403);
        }

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
        Gate::authorize('approve-receivable-payments');

        try {
            $this->receivableService->approvePayment($payment, $request->user());

            $receivable = $payment->receivable;

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
        Gate::authorize('approve-receivable-payments');

        $request->validate(['reason' => 'required|string|max:500']);

        try {
            $this->receivableService->rejectPayment($payment, $request->user(), $request->reason);

            return back()->with('success', 'Pembayaran ditolak. Distributor akan diminta mengunggah ulang bukti transfer.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
