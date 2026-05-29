<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel inventories - Stok produk per user (distributor/agen).
     *
     * Setiap user memiliki inventori per produk dengan kuantitas
     * dan ambang batas stok rendah untuk notifikasi restock.
     * Constraint unique mencegah duplikasi entri stok.
     */
    public function up(): void
    {
        Schema::create('inventories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete()
                ->comment('Pemilik stok (distributor atau agen)');
            $table->foreignId('product_id')
                ->constrained('products')
                ->cascadeOnDelete()
                ->comment('Produk yang disimpan');
            $table->integer('qty')->default(0)
                ->comment('Jumlah stok saat ini');
            $table->integer('low_stock_threshold')->default(200)
                ->comment('Ambang batas stok rendah untuk notifikasi');
            $table->timestamps();

            // Setiap user hanya boleh punya satu entri per produk
            $table->unique(['user_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};
