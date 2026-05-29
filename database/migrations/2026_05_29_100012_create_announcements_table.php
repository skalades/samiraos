<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel announcements - Pengumuman dari pusat ke jaringan distribusi.
     *
     * Mendukung berbagai tipe pengumuman (info, warning, promo, urgent)
     * dengan targeting berdasarkan role (semua, distributor, agen).
     * Pengumuman dapat memiliki tanggal kedaluwarsa.
     */
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->text('body');
            $table->enum('type', ['info', 'warning', 'promo', 'urgent'])
                ->default('info')
                ->comment('Jenis pengumuman menentukan tampilan visual');
            $table->enum('target_role', ['all', 'distributor', 'agen'])
                ->default('all')
                ->comment('Target audiens pengumuman');
            $table->string('attachment', 255)->nullable()
                ->comment('Path ke file lampiran (gambar, PDF, dll.)');
            $table->boolean('is_active')->default(true);
            $table->foreignId('published_by')
                ->constrained('users')
                ->comment('Admin yang menerbitkan pengumuman');
            $table->timestamp('published_at')->nullable()
                ->comment('Waktu pengumuman diterbitkan');
            $table->timestamp('expires_at')->nullable()
                ->comment('Waktu kedaluwarsa pengumuman');
            $table->timestamps();

            // Index untuk pencarian dan filter
            $table->index('type');
            $table->index('target_role');
            $table->index('is_active');
            $table->index('published_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
