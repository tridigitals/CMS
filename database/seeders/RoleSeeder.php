<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */

    public function run()
    {
        Role::create(['name' => 'superadmin']);
        Role::create(['name' => 'editor']);
        Role::create(['name' => 'author']);

        $user = User::create([
            'name' => 'Super Admin',
            'email' => 'info@tridigitals.com',
            'password' => bcrypt('sasaicoco'),
        ]);

        $user->assignRole('superadmin');
    }
}
