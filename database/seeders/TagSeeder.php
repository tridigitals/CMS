<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Tag;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Tag::truncate();
        Tag::insert([
            [
                'name' => 'Laravel',
                'slug' => \Illuminate\Support\Str::slug('Laravel'),
                'description' => 'Laravel framework',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'React',
                'slug' => \Illuminate\Support\Str::slug('React'),
                'description' => 'React library',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'API',
                'slug' => \Illuminate\Support\Str::slug('API'),
                'description' => 'API related',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
