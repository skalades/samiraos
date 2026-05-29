<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel order_items - Item detail dari setiap pesanan.
     *
     * Menyimpan produk, kuantitas, dan harga per unit
     * pada saat pesanan dibuat (snapshot harga).
     */
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')
                ->constrained('orders')
                ->cascadeOnDelete()
                ->comment('Pesanan induk');
            $table->foreignId('product_id')
                ->constrained('products')
                ->comment('Produk yang dipesan');
            $table->integer('qty')
                ->comment('Jumlah unit yang dipesan');
            $table->decimal('unit_price', 12, 2)
                ->comment('Harga per unit saat pemesanan (snapshot)');
            $table->decimal('subtotal', 15, 2)
                ->comment('qty × unit_price');
            $table->timestamps();

            // Index untuk join dan reporting
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
