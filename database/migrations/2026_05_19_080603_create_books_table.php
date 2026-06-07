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
        // ini untuk digital book
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();


            // Informasi buku

            $table->string('title');

            $table->string('publisher')->nullable();
            $table->string('author')->nullable();

            // Tahun terbit
            $table->integer('publish_year')->nullable();

            // Abstrak / deskripsi
            $table->text('abstract')->nullable();
            $table->text('pdf_file')->nullable();

            $table->integer('reading_duration')->default(10); // 10 menit default


            $table->timestamps();

            $table->index(['id'], 'idx_book_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
