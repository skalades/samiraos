<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('bank_name', 50)->comment('Nama Bank (contoh: BCA, Mandiri)');
            $table->string('account_number', 50)->unique()->comment('Nomor Rekening');
            $table->string('account_holder', 100)->comment('Nama Pemilik Rekening');
            $table->boolean('is_active')->default(true)->comment('Status Aktif/Non-aktif');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_accounts');
    }
};
