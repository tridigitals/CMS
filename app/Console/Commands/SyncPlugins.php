<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Plugin;
use Illuminate\Support\Facades\File;

class SyncPlugins extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'plugins:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync all modules in Modules folder to plugins table';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        // 1. Ambil semua folder di Modules/
        $modulesPath = base_path('Modules');
        $modules = File::directories($modulesPath);

        foreach ($modules as $modulePath) {
            // 2. Baca file module.json di setiap module
            $moduleJson = $modulePath . '/module.json';
            if (File::exists($moduleJson)) {
                $meta = json_decode(File::get($moduleJson), true);
                // 3. Cek apakah sudah terdaftar di tabel plugins
                if (!Plugin::where('name', $meta['name'])->exists()) {
                    // 4. Jika belum, insert ke tabel plugins
                    Plugin::create([
                        'name' => $meta['name'],
                        'alias' => $meta['alias'] ?? null,
                        'version' => $meta['version'] ?? null,
                        'description' => $meta['description'] ?? null,
                        // Tambahkan kolom lain sesuai kebutuhan
                    ]);
                    $this->info("Registered plugin: {$meta['name']}");
                }
            }
        }
        $this->info('Sync complete.');
        return 0;
    }
}
