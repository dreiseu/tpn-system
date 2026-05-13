<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Update tblTpnOrders
        Schema::table('tblTpnOrders', function (Blueprint $table) {
            $table->string('created_by', 50)->nullable()->change();
            $table->string('modified_by', 50)->nullable()->change();
        });

        // 2. Update tblTpnOrderComputations
        Schema::table('tblTpnOrderComputations', function (Blueprint $table) {
            if (!Schema::hasColumn('tblTpnOrderComputations', 'created_by')) {
                $table->string('created_by', 50)->nullable();
            }
            if (!Schema::hasColumn('tblTpnOrderComputations', 'modified_by')) {
                $table->string('modified_by', 50)->nullable();
            }
        });

        // 3. Update tblTpnOrderStatusHistory
        Schema::table('tblTpnOrderStatusHistory', function (Blueprint $table) {
            $table->string('changed_by', 50)->nullable()->change();
        });

        // 4. Update tblTpnOrderSequence
        Schema::table('tblTpnOrderSequence', function (Blueprint $table) {
            if (!Schema::hasColumn('tblTpnOrderSequence', 'created_by')) {
                $table->string('created_by', 50)->nullable();
            }
            if (!Schema::hasColumn('tblTpnOrderSequence', 'modified_by')) {
                $table->string('modified_by', 50)->nullable();
            }
            if (!Schema::hasColumn('tblTpnOrderSequence', 'created_at')) {
                $table->timestamp('created_at')->nullable();
            }
            if (!Schema::hasColumn('tblTpnOrderSequence', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }
        });

        // 5. Update UserAuthority
        Schema::table('UserAuthority', function (Blueprint $table) {
            if (!Schema::hasColumn('UserAuthority', 'created_by')) {
                $table->string('created_by', 50)->nullable();
            }
            if (!Schema::hasColumn('UserAuthority', 'modified_by')) {
                $table->string('modified_by', 50)->nullable();
            }
        });
    }

    public function down(): void
    {
        // Reverting would require knowing original types (BIGINT)
    }
};
