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
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('path')->unique();
            $table->enum('public_status', ['public', 'private'])->default('public');
            $table->string('number')->nullable(); // e.g., "01."
            $table->string('subtitle')->nullable();
            $table->longText('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('currency')->default('EUR'); // Viva Wallet currency
            $table->string('viva_wallet_product_id')->nullable(); // Viva Wallet product ID
            $table->string('category')->nullable(); // e.g., "Screening", "Men", "Women"
            $table->string('age_group')->nullable(); // e.g., "18+", "40+"
            $table->text('purpose')->nullable();
            $table->json('preparation')->nullable(); // Preparation instructions array
            $table->json('tests')->nullable(); // Tests array
            $table->json('faq')->nullable(); // FAQ array
            $table->foreignId('main_image_id')->nullable()->constrained('upload_files')->nullOnDelete();
            $table->unsignedBigInteger('order_id')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
