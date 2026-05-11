<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tblTpnOrderComputations', function (Blueprint $table) {
            // Check if the column exists before trying to add it
            if (!Schema::hasColumn('tblTpnOrderComputations', 'heparin_ml')) {
                $table->decimal('heparin_ml', 8, 2)->nullable()->after('multivitamins_ml_day');
            }

            // Check the second column too
            if (!Schema::hasColumn('tblTpnOrderComputations', 'heparin_iu_per_ml')) {
                $table->decimal('heparin_iu_per_ml', 8, 2)->nullable()->after('heparin_ml');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tblTpnOrderComputations', function (Blueprint $table) {
            $table->dropColumn(['heparin_ml', 'heparin_iu_per_ml']);
        });
    }
};
