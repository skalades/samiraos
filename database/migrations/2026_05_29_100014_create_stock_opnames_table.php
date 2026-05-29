<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel stock_opnames - Stock opname dan penyesuaian stok.
     *
     * Mencatat hasil penghitungan fisik stok, penolakan produk,
     * dan penyesuaian manual. Setiap record menyimpan selisih
     * antara stok sistem dan stok aktual untuk audit trail.
     */
    public function up(): void
    {
        Schema::create('stock_opnames', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete()
                ->comment('User yang melakukan stock opname');
            $table->foreignId('product_id')
                ->constrained('products')
                ->cascadeOnDelete()
                ->comment('Produk yang dihitung');
            $table->integer('system_qty')
                ->comment('Jumlah stok menurut sistem saat opname');
            $table->integer('actual_qty')
                ->comment('Jumlah stok aktual hasil penghitungan fisik');
            $table->integer('difference')
                ->comment('Selisih: actual_qty - system_qty (negatif = kurang)');
            $table->enum('type', ['opname', 'reject', 'adjustment'])
                ->comment('Jenis penyesuaian stok');
            $table->text('reason')->nullable()
                ->comment('Alasan penyesuaian (wajib untuk reject/adjustment)');
            $table->timestamps();

            // Index untuk pencarian dan filter
            $table->index('user_id');
            $table->index('product_id');
            $table->index('type');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_opnames');
    }
};
