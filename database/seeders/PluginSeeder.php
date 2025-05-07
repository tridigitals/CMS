<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class PluginSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('plugins')->insertOrIgnore([
            [
                'name' => 'Contact Form',
                'description' => 'Modul untuk menambah form kontak pada website.',
                'active' => false,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}