<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('tblTpnOrderComputations', 'sterile_water_level_ml_day')) {
            return;
        }

        if (Schema::hasColumn('tblTpnOrderComputations', 'sterile_water_ml_day')) {
            if (DB::connection()->getDriverName() === 'sqlsrv') {
                DB::statement("EXEC sp_rename 'tblTpnOrderComputations.sterile_water_ml_day', 'sterile_water_level_ml_day', 'COLUMN'");

                return;
            }

            Schema::table('tblTpnOrderComputations', function (Blueprint $table) {
                $table->renameColumn('sterile_water_ml_day', 'sterile_water_level_ml_day');
            });

            return;
        }

        if (Schema::hasColumn('tblTpnOrderComputations', 'sterile_water_ml')) {
            if (DB::connection()->getDriverName() === 'sqlsrv') {
                DB::statement("EXEC sp_rename 'tblTpnOrderComputations.sterile_water_ml', 'sterile_water_level_ml_day', 'COLUMN'");

                return;
            }

            Schema::table('tblTpnOrderComputations', function (Blueprint $table) {
                $table->renameColumn('sterile_water_ml', 'sterile_water_level_ml_day');
            });

            return;
        }

        Schema::table('tblTpnOrderComputations', function (Blueprint $table) {
            $table->decimal('sterile_water_level_ml_day', 8, 2)->nullable()->after('multivitamins_ml_day');
        });
    }

    public function down(): void
    {
        if (
            Schema::hasColumn('tblTpnOrderComputations', 'sterile_water_level_ml_day') &&
            ! Schema::hasColumn('tblTpnOrderComputations', 'sterile_water_ml_day')
        ) {
            if (DB::connection()->getDriverName() === 'sqlsrv') {
                DB::statement("EXEC sp_rename 'tblTpnOrderComputations.sterile_water_level_ml_day', 'sterile_water_ml_day', 'COLUMN'");

                return;
            }

            Schema::table('tblTpnOrderComputations', function (Blueprint $table) {
                $table->renameColumn('sterile_water_level_ml_day', 'sterile_water_ml_day');
            });
        }
    }
};
