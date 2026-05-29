<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReceivableController;
use App\Http\Controllers\TerritoryController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes — Sami Raos DMS
|--------------------------------------------------------------------------
*/

// Landing page
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// ──────────────────────────────────────────────
// Authenticated Routes
// ──────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard (role-based routing)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ──────────────────────────────────────────────
    // Orders (PO) — Semua role bisa akses
    // ──────────────────────────────────────────────
    Route::prefix('orders')->name('orders.')->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('index');
        Route::get('/create', [OrderController::class, 'create'])->name('create');
        Route::post('/', [OrderController::class, 'store'])->name('store');
        Route::get('/{order}', [OrderController::class, 'show'])->name('show');
        Route::get('/{order}/print-label', [OrderController::class, 'printLabel'])->name('print-label');
        Route::post('/{order}/approve', [OrderController::class, 'approve'])->name('approve');
        Route::post('/{order}/reject', [OrderController::class, 'reject'])->name('reject');
        Route::post('/{order}/ship', [OrderController::class, 'ship'])->name('ship');
        Route::post('/{order}/deliver', [OrderController::class, 'deliver'])->name('deliver');
    });

    // ──────────────────────────────────────────────
    // Piutang (Receivables) — Super Admin & Distributor
    // ──────────────────────────────────────────────
    Route::middleware('role:super_admin,distributor')->prefix('receivables')->name('receivables.')->group(function () {
        Route::get('/', [ReceivableController::class, 'index'])->name('index');
        Route::get('/{receivable}', [ReceivableController::class, 'show'])->name('show');
        Route::post('/{receivable}/pay', [ReceivableController::class, 'submitPayment'])->name('pay');
        Route::post('/payments/{payment}/approve', [ReceivableController::class, 'approvePayment'])->name('payments.approve');
        Route::post('/payments/{payment}/reject', [ReceivableController::class, 'rejectPayment'])->name('payments.reject');
    });

    // ──────────────────────────────────────────────
    // Stock Opname & Lapor Produk Rusak (Distributor & Super Admin)
    // ──────────────────────────────────────────────
    Route::middleware('role:super_admin,distributor')->prefix('stock-opnames')->name('stock-opnames.')->group(function () {
        Route::get('/', [\App\Http\Controllers\StockOpnameController::class, 'index'])->name('index');
        Route::post('/', [\App\Http\Controllers\StockOpnameController::class, 'store'])->name('store');
    });

    // ──────────────────────────────────────────────
    // Super Admin Only Routes
    // ──────────────────────────────────────────────
    Route::middleware('role:super_admin')->group(function () {

        // Master Produk
        Route::resource('products', ProductController::class);

        // Territories
        Route::get('/territories', [TerritoryController::class, 'index'])->name('territories.index');
        Route::put('/territories/{territory}', [TerritoryController::class, 'update'])->name('territories.update');

        // Pengumuman & Broadcast
        Route::resource('announcements', AnnouncementController::class)->only(['index', 'create', 'store', 'destroy']);

        // Activity Logs
        Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');

        // Rekening Bank (Bank Accounts)
        Route::resource('bank-accounts', \App\Http\Controllers\BankAccountController::class)->except(['create', 'show', 'edit']);
    });
});

require __DIR__.'/auth.php';
