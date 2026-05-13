<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('UserAuthority', function (Blueprint $table) {
            $table->id();
            $table->string('FullName')->nullable();
            $table->string('BiometricID')->unique();
            $table->integer('UserPrivilege')->default(0);
            $table->string('Section')->nullable();
            $table->string('Division')->nullable();
            $table->string('Position')->nullable();
            $table->string('SectionName')->nullable();
            $table->string('PositionName')->nullable();
            $table->dateTime('LastLogin')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('UserAuthority');
    }
};
