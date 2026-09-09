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
        Schema::table('viva_wallet_orders', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('package_id')->constrained()->nullOnDelete();
            $table->unsignedInteger('quantity')->default(1)->after('sampling_centre');
            $table->string('result_status')->default('pending')->after('payment_status');
            $table->string('result_reference')->nullable()->after('result_status');
            $table->datetime('result_received_at')->nullable()->after('result_reference');
            $table->json('result_payload')->nullable()->after('result_received_at');

            $table->index(['user_id', 'email']);
            $table->index('result_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('viva_wallet_orders', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'email']);
            $table->dropIndex(['result_status']);
            $table->dropConstrainedForeignId('user_id');

            $table->dropColumn([
                'quantity',
                'result_status',
                'result_reference',
                'result_received_at',
                'result_payload',
            ]);
        });
    }
};
