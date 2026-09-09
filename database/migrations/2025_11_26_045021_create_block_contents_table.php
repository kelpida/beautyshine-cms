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
        Schema::create('block_contents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('component_name');
            $table->foreignId('page_id')->references('id')->on('pages')->onDelete('cascade');
            $table->json('content')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('block_contents');
    }
};
