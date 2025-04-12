<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Category::insert([
            [
                'name' => 'Technology',
                'description' => 'All about tech',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Health',
                'description' => 'Health and wellness',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Education',
                'description' => 'Education topics',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
