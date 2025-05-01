<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        Menu::create([
            'name' => 'Primary Navigation',
            'location' => 'primary',
        ]);

        Menu::create([
            'name' => 'Footer Menu',
            'location' => 'footer',
        ]);
    }
}