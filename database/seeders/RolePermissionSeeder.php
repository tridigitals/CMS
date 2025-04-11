<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Permissions
        $permissions = [
            'manage users',
            'manage posts',
            'manage pages',
            'manage media',
            'manage settings',
            'manage plugins',
            'manage themes',
            'view analytics',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        // Roles
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $editor = Role::firstOrCreate(['name' => 'editor']);
        $author = Role::firstOrCreate(['name' => 'author']);

        // Assign all permissions to admin
        $admin->syncPermissions($permissions);

        // Editor: manage posts, pages, media
        $editor->syncPermissions([
            'manage posts',
            'manage pages',
            'manage media',
        ]);

        // Author: manage posts only
        $author->syncPermissions([
            'manage posts',
        ]);

        // Create admin user if not exists
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@cms.local'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('admin12345'),
            ]
        );
        $adminUser->assignRole($admin);
    }
}
