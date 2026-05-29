<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel orders - Pesanan (Purchase Order) dalam jaringan distribusi.
     *
     * Mendukung dua jenis alur:
     * - distributor_to_pusat: Distributor memesan ke pusat
     * - agen_to_distributor: Agen memesan ke distributor
     *
     * Status mengikuti workflow:
     * pending → approved → processing → shipped → delivered
     * Dapat di-reject atau cancelled kapan saja sebelum delivered.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 30)->unique()
                ->comment('Nomor PO unik, format: PO-YYYYMMDD-XXXXX');
            $table->enum('type', ['distributor_to_pusat', 'agen_to_distributor'])
                ->comment('Arah alur pesanan');
            $table->foreignId('buyer_id')
                ->constrained('users')
                ->comment('Pembeli (distributor atau agen)');
            $table->foreignId('seller_id')
                ->constrained('users')
                ->comment('Penjual (pusat/super_admin atau distributor)');
            $table->enum('payment_type', ['cash', 'tempo'])
                ->comment('Jenis pembayaran: tunai atau tempo');
            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
                'processing',
                'shipped',
                'delivered',
                'cancelled',
            ])->default('pending');
            $table->decimal('subtotal', 15, 2)
                ->comment('Total sebelum diskon');
            $table->decimal('discount', 15, 2)->default(0)
                ->comment('Nominal diskon');
            $table->decimal('total', 15, 2)
                ->comment('Total akhir (subtotal - discount)');
            $table->text('notes')->nullable();
            $table->timestamp('shipped_at')->nullable()
                ->comment('Waktu pengiriman');
            $table->timestamp('delivered_at')->nullable()
                ->comment('Waktu penerimaan oleh pembeli');
            $table->timestamps();
            $table->softDeletes();

            // Index untuk pencarian dan filter
            $table->index('type');
            $table->index('status');
            $table->index('payment_type');
            $table->index('buyer_id');
            $table->index('seller_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
