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
        Schema::table('packages', function (Blueprint $table) {
            $table->foreignId('package_gender_id')->nullable()->after('package_status_id')->constrained('package_genders')->nullOnDelete();
            $table->foreignId('package_age_id')->nullable()->after('package_gender_id')->constrained('package_ages')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropForeign(['package_gender_id']);
            $table->dropForeign(['package_age_id']);
            $table->dropColumn(['package_gender_id', 'package_age_id']);
        });
    }
};
