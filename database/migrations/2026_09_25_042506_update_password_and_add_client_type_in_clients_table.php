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
        Schema::table('clients', function (Blueprint $table) {
            // Change password to nullable
            $table->string('password')->nullable()->change();

            // Add client_type column with values 'guest', 'registered'
            $table->enum('client_type', ['guest', 'registered'])->default('guest')->after('email');
        });

        DB::table('clients')->whereNotNull('password')->update(['client_type' => 'registered']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('password')->nullable(false)->change();

            // Remove client_type column
            $table->dropColumn('client_type');
        });
    }
};
