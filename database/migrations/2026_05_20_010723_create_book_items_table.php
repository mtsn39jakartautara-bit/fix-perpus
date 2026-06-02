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
        // ini table untuk list buku fisik untuk peminjaman
        Schema::create('book_items', function (Blueprint $table) {
            $table->id();
            $table->string('barcode')->unique();

            $table->foreignId('physical_book_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->enum('status', [
                'available',
                'borrowed',
                'lost',
                'damaged',
            ])->default('available');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_items');
    }
};
