<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('categories')->delete();
        Category::insert([
            [
                'name' => 'Technology',
                'slug' => \Illuminate\Support\Str::slug('Technology'),
                'description' => 'All about tech',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Health',
                'slug' => \Illuminate\Support\Str::slug('Health'),
                'description' => 'Health and wellness',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Education',
                'slug' => \Illuminate\Support\Str::slug('Education'),
                'description' => 'Education topics',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
