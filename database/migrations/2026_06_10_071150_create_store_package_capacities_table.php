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
        Schema::create('store_package_capacities', function (Blueprint $table) {
            $table->id();
            $table->foreignId("store_id")->constrained()->cascadeOnDelete();
            $table->foreignId("package_id")->constrained()->cascadeOnDelete();
            $table->unsignedInteger('max_concurrent_bookings')
                ->default(1);
            $table->timestamps();

            $table->unique([
                'store_id',
                'package_id',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_package_capacities');
    }
};
