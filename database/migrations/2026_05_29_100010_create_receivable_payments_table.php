<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel receivable_payments - Pembayaran piutang oleh distributor.
     *
     * Mendukung dual-verification:
     * 1. Distributor mengunggah bukti transfer
     * 2. Admin pusat memverifikasi (approve/reject)
     *
     * Setiap piutang bisa dibayar bertahap (cicilan).
     */
    public function up(): void
    {
        Schema::create('receivable_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('receivable_id')
                ->constrained('central_receivables')
                ->cascadeOnDelete()
                ->comment('Piutang yang dibayar');
            $table->decimal('amount', 15, 2)
                ->comment('Nominal pembayaran dalam Rupiah');
            $table->string('payment_proof', 255)
                ->comment('Path ke file bukti transfer yang diunggah');
            $table->string('bank_name', 100)->nullable()
                ->comment('Nama bank pengirim');
            $table->string('account_number', 50)->nullable()
                ->comment('Nomor rekening pengirim');
            $table->date('transfer_date')
                ->comment('Tanggal transfer dilakukan');
            $table->enum('status', ['pending_verification', 'approved', 'rejected'])
                ->default('pending_verification');
            $table->foreignId('verified_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->comment('Admin yang melakukan verifikasi');
            $table->timestamp('verified_at')->nullable()
                ->comment('Waktu verifikasi dilakukan');
            $table->text('rejection_reason')->nullable()
                ->comment('Alasan penolakan (jika ditolak)');
            $table->timestamps();

            // Index untuk pencarian dan filter
            $table->index('receivable_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receivable_payments');
    }
};
