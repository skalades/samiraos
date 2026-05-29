<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel product_prices - Harga produk per tier distribusi.
     *
     * Setiap produk memiliki harga berbeda untuk setiap level:
     * - pusat: HPP / harga dasar
     * - distributor: harga beli distributor dari pusat
     * - agen: harga beli agen dari distributor
     *
     * Constraint unique mencegah duplikasi harga per tier per produk.
     */
    public function up(): void
    {
        Schema::create('product_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')
                ->constrained('products')
                ->cascadeOnDelete();
            $table->enum('tier', ['pusat', 'distributor', 'agen'])
                ->comment('Tier harga dalam hierarki distribusi');
            $table->decimal('price', 12, 2)
                ->comment('Harga per unit dalam Rupiah');
            $table->integer('min_qty')->default(1)
                ->comment('Jumlah minimum pemesanan untuk tier ini');
            $table->timestamps();

            // Setiap produk hanya boleh punya satu harga per tier
            $table->unique(['product_id', 'tier']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_prices');
    }
};
