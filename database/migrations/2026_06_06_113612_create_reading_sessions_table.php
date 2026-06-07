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
        Schema::create('reading_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('book_id')->constrained()->onDelete('cascade');
            $table->date('session_date'); // Tanggal session dibuat
            $table->integer('remaining_seconds')->default(0);
            $table->boolean('is_active')->default(false);
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamps();

            // Unique untuk user, book, DAN tanggal
            $table->unique(['user_id', 'book_id', 'session_date'], 'unique_user_book_date');

            $table->index(['user_id', 'book_id', 'session_date'], 'idx_user_book_date');
            $table->index(['session_date'], 'idx_session_date');
            $table->index(['remaining_seconds'], 'idx_remaining_seconds');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reading_sessions');
    }
};
