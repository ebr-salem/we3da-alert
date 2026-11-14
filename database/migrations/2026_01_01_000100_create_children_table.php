<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('children', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->date('birth_date');
            $table->string('gender')->default('male');
            $table->string('national_id')->nullable();
            $table->string('parent_name');
            $table->string('parent_phone');
            $table->string('alt_phone')->nullable();
            $table->string('address')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('full_name');
            $table->index('birth_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('children');
    }
};
