<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            'dashboard.view',
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'customers.view',
            'customers.create',
            'customers.edit',
            'customers.delete',
            'mikrotik.view',
            'mikrotik.manage',
            'monitoring.view',
            'payments.view',
            'payments.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $operatorRole = Role::firstOrCreate(['name' => 'operator']);
        $viewerRole = Role::firstOrCreate(['name' => 'viewer']);

        // Assign permissions to roles
        $adminRole->givePermissionTo(Permission::all());
        
        $operatorRole->givePermissionTo([
            'dashboard.view',
            'customers.view',
            'customers.create',
            'customers.edit',
            'mikrotik.view',
            'monitoring.view',
            'payments.view',
        ]);

        $viewerRole->givePermissionTo([
            'dashboard.view',
            'customers.view',
            'monitoring.view',
            'payments.view',
        ]);
    }
}
