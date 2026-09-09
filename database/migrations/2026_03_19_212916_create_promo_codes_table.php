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
        Schema::create('promo_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->enum('discount_type', ["percent", "amount"])->default("amount");
            $table->decimal("discount_value", 8, 2);
            $table->boolean('is_active')->default(true);
            $table->boolean('has_limitation')->default(false);
            $table->unsignedBigInteger('used_count')->default(0);

            // limitation
            $table->decimal("max_discount_amount", 8, 2)->nullable();
            $table->decimal("min_order_amount", 8, 2)->nullable();
            $table->unsignedBigInteger('usage_limit')->nullable();
            $table->string('special_user')->nullable(); // for specific user limitation, can be email or user id

            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promo_codes');
    }
};
