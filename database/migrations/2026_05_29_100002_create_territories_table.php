<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel territories - Wilayah distribusi Sami Raos.
     *
     * Menyimpan data 17 wilayah distributor beserta koordinat
     * dan kapasitas stok maksimum per wilayah.
     * Mendukung GeoJSON polygon untuk visualisasi peta.
     */
    public function up(): void
    {
        Schema::create('territories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->decimal('latitude', 10, 8)->nullable()
                ->comment('Koordinat lintang titik pusat wilayah');
            $table->decimal('longitude', 11, 8)->nullable()
                ->comment('Koordinat bujur titik pusat wilayah');
            $table->integer('max_stock_capacity')->default(5000)
                ->comment('Kapasitas stok maksimum wilayah dalam unit');
            $table->json('geojson_feature')->nullable()
                ->comment('GeoJSON polygon untuk batas wilayah di peta');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('territories');
    }
};
