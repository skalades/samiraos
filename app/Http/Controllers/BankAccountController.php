<?php

namespace App\Http\Controllers;

use App\Models\BankAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use App\Services\AuditService;

class BankAccountController extends Controller
{
    public function __construct(private readonly AuditService $auditService) {}

    public function index(): Response
    {
        $accounts = BankAccount::latest()->get();
        return Inertia::render('BankAccounts/Index', [
            'accounts' => $accounts
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'bank_name' => 'required|string|max:50',
            'account_number' => 'required|string|max:50|unique:bank_accounts,account_number',
            'account_holder' => 'required|string|max:100',
            'is_active' => 'boolean',
        ]);

        $account = BankAccount::create($validated);

        $this->auditService->log(
            user: $request->user(),
            actionType: 'CREATE_BANK_ACCOUNT',
            description: "Menambahkan rekening bank baru: {$account->bank_name} - {$account->account_number}",
            entity: $account
        );

        return back()->with('success', 'Rekening bank berhasil ditambahkan.');
    }

    public function update(Request $request, BankAccount $bankAccount): RedirectResponse
    {
        $validated = $request->validate([
            'bank_name' => 'required|string|max:50',
            'account_number' => 'required|string|max:50|unique:bank_accounts,account_number,' . $bankAccount->id,
            'account_holder' => 'required|string|max:100',
            'is_active' => 'boolean',
        ]);

        $oldValues = $bankAccount->toArray();
        $bankAccount->update($validated);

        $this->auditService->log(
            user: $request->user(),
            actionType: 'UPDATE_BANK_ACCOUNT',
            description: "Memperbarui rekening bank: {$bankAccount->bank_name}",
            entity: $bankAccount,
            oldValues: $oldValues,
            newValues: $bankAccount->fresh()->toArray()
        );

        return back()->with('success', 'Rekening bank berhasil diperbarui.');
    }

    public function destroy(Request $request, BankAccount $bankAccount): RedirectResponse
    {
        $oldValues = $bankAccount->toArray();
        $bankAccount->delete();

        $this->auditService->log(
            user: $request->user(),
            actionType: 'DELETE_BANK_ACCOUNT',
            description: "Menghapus rekening bank: {$bankAccount->bank_name}",
            entity: $bankAccount,
            oldValues: $oldValues
        );

        return back()->with('success', 'Rekening bank berhasil dihapus.');
    }
}
