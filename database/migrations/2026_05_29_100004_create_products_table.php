<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel products - Produk Sami Raos.
     *
     * Menyimpan katalog produk: Baso Geprek, Baso Aci,
     * Bakso Tulang Rangu, Seblak Series, dll.
     * Mendukung soft delete agar produk yang dihapus tetap
     * tercatat di riwayat pesanan.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('slug', 150)->unique();
            $table->string('sku', 50)->unique()
                ->comment('Stock Keeping Unit - kode unik produk');
            $table->text('description')->nullable();
            $table->string('unit', 20)->default('pcs')
                ->comment('Satuan produk: pcs, pack, box, dll.');
            $table->integer('weight_grams')->nullable()
                ->comment('Berat produk dalam gram');
            $table->string('image', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            // Index untuk filter dan pencarian
            $table->index('is_active');
            $table->index('sku');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
