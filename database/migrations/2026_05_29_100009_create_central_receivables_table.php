<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel central_receivables - Piutang pusat ke distributor.
     *
     * Terbentuk otomatis saat distributor melakukan pemesanan
     * dengan tipe pembayaran tempo (kredit).
     * Melacak status pembayaran dan sisa tagihan.
     */
    public function up(): void
    {
        Schema::create('central_receivables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')
                ->constrained('orders')
                ->comment('Pesanan yang menghasilkan piutang');
            $table->foreignId('distributor_id')
                ->constrained('users')
                ->comment('Distributor yang memiliki hutang');
            $table->string('invoice_number', 30)->unique()
                ->comment('Nomor invoice unik, format: INV-YYYYMMDD-XXXXX');
            $table->decimal('total_invoice', 15, 2)
                ->comment('Total tagihan piutang');
            $table->decimal('amount_paid', 15, 2)->default(0)
                ->comment('Total yang sudah dibayarkan');
            $table->decimal('remaining_balance', 15, 2)
                ->comment('Sisa tagihan (total_invoice - amount_paid)');
            $table->date('due_date')
                ->comment('Tanggal jatuh tempo pembayaran');
            $table->enum('status', ['unpaid', 'partially_paid', 'paid', 'overdue'])
                ->default('unpaid');
            $table->timestamps();

            // Index untuk pencarian dan filter
            $table->index('distributor_id');
            $table->index('status');
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('central_receivables');
    }
};
