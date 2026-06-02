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
        Schema::create('borrowings', function (Blueprint $table) {
            $table->id();

            // Relasi user
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            // Relasi book
            $table->foreignId('book_item_id')
                ->constrained()
                ->cascadeOnDelete();

            // Tanggal peminjaman
            $table->timestamp('borrowed_at')->useCurrent();

            // Batas pengembalian
            $table->timestamp('due_date')->nullable();


            // Tanggal dikembalikan
            $table->timestamp('returned_at')->nullable();

            // Status
            $table->enum('status', [
                'borrowed',
                'returned',
                'late',
            ])->default('borrowed');

            // denda
            $table->integer('fine_amount')
                ->default(0);

            // apakah sudah dibayar
            $table->boolean('fine_paid')
                ->default(false);

            $table->timestamp('extended_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('borrowings');
    }
};
