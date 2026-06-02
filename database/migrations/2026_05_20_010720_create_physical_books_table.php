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
        Schema::create('physical_books', function (Blueprint $table) {
            $table->id();


            // Informasi buku
            $table->string('title');
            $table->string('isbn')->nullable();
            $table->string('publisher')->nullable();
            $table->string('author')->nullable();

            // Lokasi rak
            $table->string('location_rack')->nullable();

            // Tahun terbit
            $table->integer('publish_year')->nullable();

            // Abstrak / deskripsi
            $table->text('abstract')->nullable();

            // Gambar buku
            $table->string('cover_image')->nullable();

            // stok buku
            $table->integer('stock')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('physical_books');
    }
};
