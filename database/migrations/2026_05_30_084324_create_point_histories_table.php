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
        Schema::create('point_histories', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('point_period_id')
                ->constrained()
                ->cascadeOnDelete();


            // jenis aktivitas
            $table->enum('type', [
                'visit_online',
                'visit_offline',
                'borrow_book',
                'return_book',
            ]);

            // jumlah point
            $table->integer('points');

            // catatan tambahan
            $table->text('description')->nullable();

            $table->timestamps();

            $table->index([
                'user_id',
                'point_period_id'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('point_histories');
    }
};
