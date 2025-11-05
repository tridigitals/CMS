<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::firstOrCreate([
            'email' => 'admin@example.com',
        ], [
            'name' => 'Admin User',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        $admin->assignRole('admin');

        // Create operator user
        $operator = User::firstOrCreate([
            'email' => 'operator@example.com',
        ], [
            'name' => 'Operator User',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        $operator->assignRole('operator');

        // Create viewer user
        $viewer = User::firstOrCreate([
            'email' => 'viewer@example.com',
        ], [
            'name' => 'Viewer User',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        $viewer->assignRole('viewer');
    }
}
