<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('nis')->unique();

            $table->enum('gender', ['male', 'female']);


            $table->string('parent_phone')->nullable();
            $table->text('address')->nullable();
            $table->timestamps();

            $table->enum('status', [
                'active',
                'graduated',
                'transferred',
                'dropped'
            ])->default('active');

            // Index untuk performa query
            $table->index('nis');
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
