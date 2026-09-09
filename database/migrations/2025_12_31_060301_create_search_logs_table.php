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
        Schema::create('search_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('visitor_id'); //anonymous session id
            $table->foreignId('client_id')
                ->nullable()
                ->constrained('clients')
                ->cascadeOnDelete();
            $table->json('filter');
            $table->timestamps();

            $table->index('visitor_id');
            $table->index('client_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('search_logs');
    }
};
