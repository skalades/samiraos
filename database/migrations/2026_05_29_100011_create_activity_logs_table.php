<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel activity_logs - Jejak audit untuk seluruh operasi CRUD.
     *
     * Mencatat setiap perubahan data penting dalam sistem
     * untuk keperluan audit, keamanan, dan pelacakan aktivitas.
     * Menyimpan snapshot nilai lama dan baru dalam format JSON.
     */
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete()
                ->comment('Pengguna yang melakukan aksi');
            $table->string('action_type', 50)
                ->comment('Jenis aksi: created, updated, deleted, login, dll.');
            $table->string('entity_type', 100)->nullable()
                ->comment('Model/tabel yang diubah, misal: App\\Models\\Order');
            $table->unsignedBigInteger('entity_id')->nullable()
                ->comment('ID record yang diubah');
            $table->text('description')
                ->comment('Deskripsi aktivitas dalam bahasa yang mudah dibaca');
            $table->json('old_values')->nullable()
                ->comment('Snapshot nilai sebelum perubahan');
            $table->json('new_values')->nullable()
                ->comment('Snapshot nilai setelah perubahan');
            $table->string('ip_address', 45)->nullable()
                ->comment('Alamat IP pengguna (IPv4 atau IPv6)');
            $table->string('user_agent', 255)->nullable()
                ->comment('User agent browser pengguna');
            $table->timestamp('created_at')
                ->comment('Waktu aktivitas tercatat');

            // Index untuk pencarian dan filter audit log
            $table->index('user_id');
            $table->index('action_type');
            $table->index(['entity_type', 'entity_id']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
