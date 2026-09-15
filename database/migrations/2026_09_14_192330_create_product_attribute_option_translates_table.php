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
        Schema::create('product_attribute_option_translates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_attribute_option_id')->constrained('product_attribute_options', 'id', 'pao_trans_option_id_fk')->onDelete('cascade');
            $table->string('locale')->index();
            $table->string('name');
            $table->timestamps();
            $table->unique(['product_attribute_option_id', 'locale'], 'pao_trans_option_locale_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_attribute_option_translates');
    }
};
