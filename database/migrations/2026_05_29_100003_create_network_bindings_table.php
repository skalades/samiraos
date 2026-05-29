<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel network_bindings - Ikatan jaringan distribusi.
     *
     * Menghubungkan user dengan territory dan menentukan hierarki:
     * - Distributor terikat ke territory, memiliki credit limit
     * - Agen terikat ke territory dan parent distributor
     *
     * Setiap user hanya boleh memiliki satu binding (unique user_id).
     */
    public function up(): void
    {
        Schema::create('network_bindings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete()
                ->comment('User yang terikat');
            $table->enum('role', ['distributor', 'agen'])
                ->comment('Role dalam jaringan distribusi');
            $table->foreignId('territory_id')
                ->constrained('territories')
                ->cascadeOnDelete()
                ->comment('Wilayah yang ditangani');
            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->comment('Distributor induk (wajib untuk agen)');
            $table->decimal('credit_limit', 15, 2)->default(0)
                ->comment('Batas kredit untuk pembayaran tempo (hanya distributor)');
            $table->decimal('credit_used', 15, 2)->default(0)
                ->comment('Kredit yang sudah terpakai');
            $table->timestamps();

            // Setiap user hanya boleh memiliki satu binding
            $table->unique('user_id');

            // Index untuk pencarian berdasarkan territory dan parent
            $table->index('territory_id');
            $table->index('parent_id');
            $table->index('role');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('network_bindings');
    }
};
