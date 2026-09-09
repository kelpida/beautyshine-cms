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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId("client_id")->constrained()->cascadeOnDelete();
            $table->foreignId("promo_code_id")
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->decimal("amount", 10, 2);
            $table->decimal("discount_amount", 10, 2)->default(0);
            $table->decimal("total_amount", 10, 2);
            $table->enum('status', [
                'pending',     // order created
                'processing',  // optional (preparing / scheduled)
                'completed',   // service delivered
                'cancelled'    // manually cancelled
            ])->default('pending');
            $table->boolean('is_seen')->default(false);
            $table->timestamp('seen_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
