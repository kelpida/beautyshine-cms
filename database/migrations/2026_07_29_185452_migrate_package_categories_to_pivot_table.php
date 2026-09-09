<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $packages = DB::table('packages')
            ->whereNotNull('package_category_id')
            ->get(['id', 'package_category_id']);

        $rows = [];

        foreach ($packages as $package) {
            $rows[] = [
                'package_id' => $package->id,
                'package_category_id' => $package->package_category_id,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if (!empty($rows)) {
            DB::table('package_category_assignees')->insert($rows);
        }
    }

    public function down(): void
    {
        DB::table('package_category_assignees')->truncate();
    }
};
