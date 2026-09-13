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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->text('short_description')->nullable();
            $table->unsignedBigInteger('main_image_id')->nullable();
            $table->decimal('base_price', 10, 2)->nullable();
            $table->decimal('sale_price', 10, 2)->nullable();
            $table->enum('product_type', ['simple', 'configurable'])->default('simple');
            $table->boolean('is_customizable')->default(false);
            $table->enum('status', ['draft' ,'public' ,'archived', 'inactive'])->default('draft');
            $table->integer('sort_order')->default(0);
            $table->text('allergens_text')->nullable();
            $table->text('delivery_info')->nullable();
            $table->text('product_care')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('eshop_category_id')->nullable();
            $table->foreign('main_image_id')->references('id')->on('upload_files')->onDelete('set null');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
