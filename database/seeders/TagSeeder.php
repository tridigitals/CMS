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
                'description' => 'Laravel framework',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'React',
                'description' => 'React library',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'API',
                'description' => 'API related',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
