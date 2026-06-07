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
        Schema::create('reading_rewards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('book_id')->constrained()->onDelete('cascade');
            $table->integer('points_earned')->default(0);
            $table->date('reward_date');
            $table->timestamps();

            // Unique untuk user, book, dan tanggal reward
            $table->unique(['user_id', 'book_id', 'reward_date'], 'unique_user_book_reward_date');

            $table->index(['user_id', 'book_id', 'reward_date'], 'idx_user_book_reward_date');
            $table->index(['reward_date'], 'idx_reward_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reading_rewards');
    }
};
