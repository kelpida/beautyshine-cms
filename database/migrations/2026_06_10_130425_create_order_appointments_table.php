<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('order_appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId("store_id")->constrained();
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedBigInteger("duration");

            $table->enum('status', [
                'pending',
                'confirmed',
                'completed',
                'cancelled'
            ]);

            $table->timestamps();

            $table->index('order_id');

            $table->index([
                'store_id',
                'date',
            ]);

            $table->index([
                'store_id',
                'date',
                'status',
            ]);

            $table->index([
                'store_id',
                'date',
                'start_time',
                'end_time',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_appointments');
    }
};
