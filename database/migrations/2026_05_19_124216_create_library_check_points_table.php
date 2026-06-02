<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        // ini untuk barcode perpus yang digunakan untuk user scan kehadiran
        Schema::create('library_check_points', function (Blueprint $table) {
            $table->id();

            $table->string('name');

            $table->string('barcode')->unique();

            $table->string('type')->default('library_visit');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('library_check_points');
    }
};
