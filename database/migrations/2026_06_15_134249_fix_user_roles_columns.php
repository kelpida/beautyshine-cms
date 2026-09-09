<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_roles', function (Blueprint $table) {

            if (!Schema::hasColumn('user_roles', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->index();
            }

            if (!Schema::hasColumn('user_roles', 'role_id')) {
                $table->unsignedBigInteger('role_id')->nullable()->index();
            }
        });

        // Remove invalid user references
        DB::statement("
            DELETE ur FROM user_roles ur
            LEFT JOIN users u ON ur.user_id = u.id
            WHERE ur.user_id IS NOT NULL AND u.id IS NULL
        ");

        // Remove invalid role references
        DB::statement("
            DELETE ur FROM user_roles ur
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE ur.role_id IS NOT NULL AND r.id IS NULL
        ");

        Schema::table('user_roles', function (Blueprint $table) {

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            $table->foreign('role_id')
                ->references('id')
                ->on('roles')
                ->cascadeOnDelete();

            $table->unique(['user_id', 'role_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_roles', function (Blueprint $table) {

            if (Schema::hasColumn('user_roles', 'user_id')) {
                $table->dropForeign(['user_id']);
            }

            if (Schema::hasColumn('user_roles', 'role_id')) {
                $table->dropForeign(['role_id']);
            }

            $table->dropUnique(['user_id', 'role_id']);
        });
    }
};
