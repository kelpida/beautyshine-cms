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
        Schema::create('holidays', function (Blueprint $table) {
            $table->id();

            $table->string('name');

            $table->foreignId('store_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->date('start_date');
            $table->date('end_date');

            $table->boolean('is_closed')->default(true);

            $table->time('open_time')->nullable();
            $table->time('close_time')->nullable();

            $table->timestamps();

            $table->index([
                'store_id',
                'start_date',
                'end_date',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('holidays');
    }
};
