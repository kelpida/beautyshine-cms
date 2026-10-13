<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserPermissionRoles extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define roles
        $roles = [
            [
                'name' => 'Superadmin',
                'code' => 'super-admin',
            ],
            [
                'name' => 'Admin',
                'code' => 'admin',
            ],
            [
                'name' => 'Editor',
                'code' => 'editor',
            ],
            [
                'name' => 'User',
                'code' => 'user',
            ],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(
                ['code' => $role['code']],
                ['name' => $role['name']]
            );
        }


        // Attach all permissions to super-admin
        $superAdminRole = Role::where('code', 'super-admin')->first();
        // $superAdminRole->permissions()->sync(Permission::all()->pluck('id'));

        // Assign selected permissions to admin
        // $admin = Role::where('code', 'admin')->first();
        // $admin->permissions()->sync(
        //     Permission::whereIn('name', [
        //         'index-post',
        //         'view-post',
        //         'edit-post',
        //         'destroy-post',
        //     ])->pluck('id')
        // );

        // // Assign selected permissions to editor
        // $editor = Role::where('code', 'editor')->first();
        // $editor->permissions()->sync(
        //     Permission::whereIn('name', [
        //         'index-post',
        //         'view-post',
        //         'store-post',
        //         'edit-post',
        //     ])->pluck('id')
        // );

        // // Assign selected permissions to user
        // $user = Role::where('code', 'user')->first();
        // $user->permissions()->sync(
        //     Permission::whereIn('name', [
        //         'index-post',
        //         'view-post',
        //     ])->pluck('id')
        // );

        // Create super-admin user
        $superAdminUser = User::firstOrCreate(
            ['email' => 'superadmin@beautyshine.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('pXvJ3kC8bA9lR6sVwE7y'), // Change this for production
            ]
        );

        // Attach role
        $superAdminUser->roles()->sync([$superAdminRole->id]);
    }
}
