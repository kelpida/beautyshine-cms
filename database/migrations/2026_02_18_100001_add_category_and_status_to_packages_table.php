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
            $table->foreignId('package_category_id')->nullable()->after('is_featured')->constrained('package_categories')->nullOnDelete();
            $table->foreignId('package_status_id')->nullable()->after('package_category_id')->constrained('package_statuses')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropForeign(['package_category_id']);
            $table->dropForeign(['package_status_id']);
            $table->dropColumn(['package_category_id', 'package_status_id']);
        });
    }
};
