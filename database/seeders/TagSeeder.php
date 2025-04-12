<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Tags\Tag;
use Illuminate\Support\Facades\DB;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('tags')->delete();

        Tag::create([
            'name' => 'Laravel',
        ]);

        Tag::create([
            'name' => 'React',
        ]);

        Tag::create([
            'name' => 'API',
        ]);
    }
}
