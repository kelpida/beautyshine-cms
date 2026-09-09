<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $resources = [
            'user' => ['index', 'view', 'store', 'edit', 'destroy'],
            'role' => ['index', 'view', 'store', 'edit', 'destroy'],
            'post' => ['index', 'view', 'store', 'edit', 'destroy', 'publish'],
            'post-category' => ['index', 'view', 'store', 'edit', 'destroy'],
            'page' => ['index', 'view', 'store', 'edit', 'destroy', 'publish'],
            'language' => ['index', 'view', 'store', 'edit', 'destroy'],
            'country' => ['index', 'view', 'store', 'edit', 'destroy'],
            'city' => ['index', 'view', 'store', 'edit', 'destroy'],
            'type' => ['index', 'view', 'store', 'edit', 'destroy'],
            'status' => ['index', 'view', 'store', 'edit', 'destroy'],
            'attribute-category' => ['index', 'view', 'store', 'edit', 'destroy'],
            'attribute' => ['index', 'view', 'store', 'edit', 'destroy'],
            'property' => ['index', 'view', 'store', 'edit', 'destroy', 'publish'],
            'upload' => ['index', 'view', 'store', 'destroy'],
            'integration' => ['index', 'view', 'store', 'edit', 'destroy'],
            'email' => ['index', 'view', 'store', 'destroy'],
            'email-template' => ['index', 'view', 'store', 'destroy'],
            'subscription' => ['index', 'view', 'store', 'edit', 'destroy'],
            'appointment' => ['index', 'view', 'store', 'edit', 'destroy'],
            'order' => ['index', 'view', 'store', 'edit', 'destroy'],
            'package' => ['index', 'view', 'store', 'edit', 'destroy'],
            'store' => ['index', 'view', 'store', 'edit', 'destroy'],
            'holiday' => ['index', 'view', 'store', 'edit', 'destroy'],
            'package-category' => ['index', 'view', 'store', 'edit', 'destroy'],
            'package-gender' => ['index', 'view', 'store', 'edit', 'destroy'],
            'package-age' => ['index', 'view', 'store', 'edit', 'destroy'],
            'package-status' => ['index', 'view', 'store', 'edit', 'destroy'],
            'test-category' => ['index', 'view', 'store', 'edit', 'destroy'],
            'client' => ['index', 'view', 'store', 'edit', 'destroy'],
            'promo-code' => ['index', 'view', 'store', 'edit', 'destroy'],
        ];

        $expected = [];

        foreach ($resources as $resource => $actions) {
            foreach ($actions as $action) {
                $name = "{$action}-{$resource}";
                $expected[] = $name;

                Permission::firstOrCreate([
                    'name' => $name
                ]);
            }
        }

        // 🔥 Remove permissions no longer defined
        Permission::whereNotIn('name', $expected)->delete();
    }
}
