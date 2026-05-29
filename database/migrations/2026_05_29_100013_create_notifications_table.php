<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel notifications - Notifikasi Laravel bawaan.
     *
     * Digunakan untuk menyimpan notifikasi database yang
     * dikirim ke pengguna melalui sistem notifikasi Laravel.
     * Terintegrasi dengan Laravel Reverb untuk broadcast real-time.
     */
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type')
                ->comment('Class notifikasi, misal: App\\Notifications\\OrderApproved');
            $table->morphs('notifiable');
            $table->text('data')
                ->comment('Payload notifikasi dalam format JSON');
            $table->timestamp('read_at')->nullable()
                ->comment('Waktu notifikasi dibaca, null = belum dibaca');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
