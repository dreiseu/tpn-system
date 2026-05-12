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
        Schema::table('tblTpnOrderComputations', function (Blueprint $table) {
            $table
                ->boolean('use_osmolarity_calculator')
                ->default(false)
                ->after('sterile_water_level_ml_day');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tblTpnOrderComputations', function (Blueprint $table) {
            $table->dropColumn('use_osmolarity_calculator');
        });
    }
};
