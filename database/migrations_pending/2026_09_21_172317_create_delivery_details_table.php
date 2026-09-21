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
        Schema::create('delivery_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId("order_id")
                ->constrained()
                ->cascadeOnDelete();
            $table->string("delivery_address")->nullable();
            $table->string("post_code")->nullable();
            $table->string("city")->nullable();
            $table->string("country")->nullable();
            $table->date("delivery_date")->nullable();
            $table->time("delivery_time")->nullable();
            $table->decimal("delivery_price", 10, 2)->default(0);
            $table->text("note")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_details');
    }
};
