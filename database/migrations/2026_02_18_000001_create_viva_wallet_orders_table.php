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
        Schema::create('viva_wallet_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->constrained()->cascadeOnDelete();
            $table->string('email');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('phone');
            $table->string('country')->default('Cyprus');
            
            // Appointment details
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->string('sampling_centre');
            
            // Payment details
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('EUR');
            $table->string('viva_wallet_order_ref')->unique(); // Viva Wallet reference
            $table->string('viva_wallet_transaction_id')->nullable()->unique();
            
            // Status tracking
            $table->enum('payment_status', ['pending', 'completed', 'failed', 'refunded', 'cancelled'])->default('pending');
            $table->datetime('payment_date')->nullable();
            
            // Store Viva Wallet response for debugging
            $table->json('viva_wallet_response')->nullable();
            
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('viva_wallet_orders');
    }
};
