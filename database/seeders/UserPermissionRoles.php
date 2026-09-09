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
            'super-admin',
            'admin',
            'editor',
            'user',
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        // Define permissions
        $permissions = [
            'store-post',
            'index-post',
            'view-post',
            'edit-post',
            'destroy-post',
            'publish-post',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        // Attach all permissions to super-admin
        $superAdminRole = Role::where('name', 'super-admin')->first();
        $superAdminRole->permissions()->sync(Permission::all()->pluck('id'));

        // Assign selected permissions to admin
        $admin = Role::where('name', 'admin')->first();
        $admin->permissions()->sync(
            Permission::whereIn('name', [
                'index-post',
                'view-post',
                'edit-post',
                'destroy-post',
            ])->pluck('id')
        );

        // Assign selected permissions to editor
        $editor = Role::where('name', 'editor')->first();
        $editor->permissions()->sync(
            Permission::whereIn('name', [
                'index-post',
                'view-post',
                'store-post',
                'edit-post',
            ])->pluck('id')
        );

        // Assign selected permissions to user
        $user = Role::where('name', 'user')->first();
        $user->permissions()->sync(
            Permission::whereIn('name', [
                'index-post',
                'view-post',
            ])->pluck('id')
        );

        // Create super-admin user
        $superAdminUser = User::firstOrCreate(
            ['email' => 'superadmin@chameleon.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'), // Change this for production
            ]
        );

        // Attach role
        $superAdminUser->roles()->sync([$superAdminRole->id]);
    }
}
