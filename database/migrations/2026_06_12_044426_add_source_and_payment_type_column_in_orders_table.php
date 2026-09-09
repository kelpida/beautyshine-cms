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
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('source', ['store', 'online'])
                ->default('online')
                ->after('total_amount');
            $table->enum('payment_method', [
                'cash',
                'card',
                'bank_transfer',
                'cash_on_delivery',
                'apple_pay',
                'google_pay'
            ])
                ->default('card')
                ->after('source');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('source');
            $table->dropColumn('payment_method');
        });
    }
};
