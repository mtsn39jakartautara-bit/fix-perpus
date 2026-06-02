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
        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            // Relasi ke user (siapa yang menambah wishlist)
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            // Relasi ke book (buku digital)
            $table->foreignId('book_id')
                ->constrained()
                ->cascadeOnDelete();

            // Catatan tambahan (opsional)
            $table->text('notes')->nullable();

            // Prioritas wishlist (1-5, 5 paling penting)
            $table->tinyInteger('priority')->default(3);

            $table->timestamps();

            // Mencegah user menambah buku yang sama ke wishlist
            $table->unique(['user_id', 'book_id']);

            // Index untuk performa query
            $table->index('user_id');
            $table->index('book_id');
            $table->index('priority');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wishlists');
    }
};
