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
        if (Schema::hasColumn('tblTpnOrderComputations', 'sterile_water_level_ml_day')) {
            return;
        }

        Schema::table('tblTpnOrderComputations', function (Blueprint $table) {
            $table->decimal('sterile_water_level_ml_day', 8, 2)->nullable()->after('multivitamins_ml_day');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('tblTpnOrderComputations', 'sterile_water_level_ml_day')) {
            return;
        }

        Schema::table('tblTpnOrderComputations', function (Blueprint $table) {
            $table->dropColumn('sterile_water_level_ml_day');
        });
    }
};
