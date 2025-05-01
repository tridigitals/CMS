<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Truncate existing roles and permissions
        DB::table('roles')->delete();
        DB::table('permissions')->delete();
        // Recreate the roles and permissions tables
        // This is optional, but it ensures that the tables are clean
        // and ready for new data.
        // You can comment this out if you want to keep existing data
        // DB::table('roles')->truncate();
        // DB::table('permissions')->truncate();
        // Permissions
        $permissions = [
            'manage users',
            'manage roles',
            'manage permissions',
            'manage posts',
            'manage pages',
            'manage menus',
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
