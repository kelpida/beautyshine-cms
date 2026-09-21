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
        Schema::create('payment_providers', function (Blueprint $table) {
            $table->id();
            $table->string("name"); // e.g. 'Viva Wallet', 'Stripe', 'JCC', 'Revolut Business'
            $table->string("code")->unique(); // 'viva', 'stripe', 'jcc', 'revolut'
            $table->text("description")->nullable();
            $table->enum("status", ["active", "inactive"])->default("active");
            $table->foreignId("logo_id")->nullable()->constrained("upload_files")->nullOnDelete();
            $table->boolean("is_production")->default(false);

            // Viva Wallet credentials
            $table->string("merchant_id")->nullable();
            $table->string("api_key")->nullable();
            $table->string("client_id")->nullable();
            $table->string("client_secret")->nullable();
            $table->string("source_code")->nullable();

            // Stripe & Revolut Business credentials
            $table->string("public_key")->nullable(); // Stripe publishable key, Revolut public key
            $table->text("secret_key")->nullable();   // Stripe secret key, Revolut secret key
            $table->string("webhook_secret")->nullable(); // Stripe & Revolut webhook secret

            // JCC Payment Systems credentials
            $table->string("acquirer_id")->nullable();
            $table->string("signature_key")->nullable();

            // Additional flexible credentials storage (JSON)
            $table->json("credentials")->nullable();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_providers');
    }
};
