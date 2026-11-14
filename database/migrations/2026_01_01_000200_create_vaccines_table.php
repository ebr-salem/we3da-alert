<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vaccines', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('vaccine_doses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vaccine_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('dose_number')->default(1);
            $table->unsignedInteger('age_in_months');
            $table->string('description')->nullable();
            $table->timestamps();

            $table->unique(['vaccine_id', 'dose_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vaccine_doses');
        Schema::dropIfExists('vaccines');
    }
};
