<?php

namespace App\Http\Controllers;

use App\Models\Plugin;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PluginManagerController extends Controller
{
    public function index()
    {
        $plugins = Plugin::all();
        return Inertia::render('Plugins/Index', [
            'plugins' => $plugins
        ]);
    }

    // Tampilkan detail plugin
    public function show($pluginId)
    {
        $plugin = Plugin::find($pluginId);
        if ($plugin) {
            return response()->json($plugin);
        }
        return response()->json(['message' => 'Plugin not found'], 404);
    }

    // Upload & install plugin (ZIP)
    public function install(Request $request)
    {
        // Validasi file
        $request->validate([
            'plugin' => 'required|file|mimes:zip',
        ]);

        $file = $request->file('plugin');
        $zip = new \ZipArchive;
        $tmpPath = storage_path('app/tmp_plugin_' . uniqid());
        if (!is_dir($tmpPath)) {
            mkdir($tmpPath, 0777, true);
        }

        if ($zip->open($file->getRealPath()) === TRUE) {
            $zip->extractTo($tmpPath);
            $zip->close();
        } else {
            return response()->json(['message' => 'Gagal ekstrak ZIP'], 422);
        }

        // Cari module.json
        $moduleJsonPath = $tmpPath . '/module.json';
        if (!file_exists($moduleJsonPath)) {
            // Coba satu folder di dalam ZIP
            $dirs = glob($tmpPath . '/*', GLOB_ONLYDIR);
            if (count($dirs) > 0 && file_exists($dirs[0] . '/module.json')) {
                $moduleJsonPath = $dirs[0] . '/module.json';
                $tmpPath = $dirs[0];
            } else {
                return response()->json(['message' => 'module.json tidak ditemukan dalam ZIP'], 422);
            }
        }

        $meta = json_decode(file_get_contents($moduleJsonPath), true);
        if (!$meta || !isset($meta['name'])) {
            return response()->json(['message' => 'module.json tidak valid'], 422);
        }

        // Cek apakah sudah ada module dengan nama sama
        $targetDir = base_path('Modules/' . $meta['name']);
        if (is_dir($targetDir)) {
            return response()->json(['message' => 'Module sudah ada'], 422);
        }

        // Pindahkan folder plugin ke Modules/
        $parentDir = dirname($targetDir);
        if (!is_dir($parentDir)) {
            mkdir($parentDir, 0777, true);
        }
        rename($tmpPath, $targetDir);

        // Insert ke database jika belum ada
        $plugin = \App\Models\Plugin::firstOrCreate(
            ['name' => $meta['name']],
            [
                'alias' => $meta['alias'] ?? null,
                'version' => $meta['version'] ?? null,
                'description' => $meta['description'] ?? null,
                'active' => false,
            ]
        );

        // Update modules_statuses.json
        $statusesPath = base_path('modules_statuses.json');
        $statuses = file_exists($statusesPath) ? json_decode(file_get_contents($statusesPath), true) : [];
        $statuses[$meta['name']] = false;
        file_put_contents($statusesPath, json_encode($statuses, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        // Bersihkan folder tmp
        if (is_dir($tmpPath)) {
            $this->deleteDirectory($tmpPath);
        }

        return response()->json(['message' => 'Plugin berhasil diinstall']);
    }

    // Update plugin (upload ZIP baru)
    public function update(Request $request, $pluginId)
    {
        // Validasi dan proses update ZIP, replace folder, update DB
        // ...
        return response()->json(['message' => 'Update feature not implemented yet']);
    }

    // Hapus plugin (DB & folder)
    public function destroy($pluginId)
    {
        $plugin = Plugin::find($pluginId);
        if (!$plugin) {
            return response()->json(['message' => 'Plugin not found'], 404);
        }

        // Drop tabel-tabel dari migration plugin & hapus row migration
        $migrationPath = base_path('Modules/' . $plugin->name . '/database/migrations');
        if (is_dir($migrationPath)) {
            foreach (glob($migrationPath . '/*.php') as $migrationFile) {
                $content = file_get_contents($migrationFile);
                // Deteksi nama tabel dari Schema::create('nama_tabel'
                if (preg_match("/Schema::create\\(['\"]([^'\"]+)['\"]/", $content, $matches)) {
                    $table = $matches[1];
                    \DB::statement("DROP TABLE IF EXISTS `$table`");
                }
                // Hapus row migration dari tabel migrations hanya jika sesuai nama file
                $migrationName = basename($migrationFile, '.php');
                \DB::table('migrations')->where('migration', $migrationName)->delete();
            }
        }

        // Hapus folder module jika ada
        $moduleDir = base_path('Modules/' . $plugin->name);
        if (is_dir($moduleDir)) {
            $this->deleteDirectory($moduleDir);
        }

        // Hapus dari DB
        $plugin->delete();

        // Update modules_statuses.json
        $statusesPath = base_path('modules_statuses.json');
        $statuses = file_exists($statusesPath) ? json_decode(file_get_contents($statusesPath), true) : [];
        unset($statuses[$plugin->name]);
        file_put_contents($statusesPath, json_encode($statuses, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return response()->json(['message' => 'Plugin, module, dan tabel migrasi berhasil dihapus']);
    }

    // Helper rekursif hapus folder
    protected function deleteDirectory($dir)
    {
        if (!file_exists($dir)) return true;
        if (!is_dir($dir)) return unlink($dir);
        foreach (scandir($dir) as $item) {
            if ($item == '.' || $item == '..') continue;
            if (!$this->deleteDirectory($dir . DIRECTORY_SEPARATOR . $item)) return false;
        }
        return rmdir($dir);
    }

    public function activate($pluginId)
    {
        $plugin = Plugin::find($pluginId);
        if ($plugin) {
            $plugin->active = true;
            $plugin->save();

            // Jalankan migration bawaan module jika ada
            $migrationPath = base_path('Modules/' . $plugin->name . '/database/migrations');
            if (is_dir($migrationPath)) {
                \Artisan::call('migrate', [
                    '--path' => 'Modules/' . $plugin->name . '/database/migrations',
                    '--force' => true,
                ]);
            }

            // Sinkron ke modules_statuses.json
            $statusesPath = base_path('modules_statuses.json');
            $statuses = file_exists($statusesPath) ? json_decode(file_get_contents($statusesPath), true) : [];
            $statuses[$plugin->name] = true;
            file_put_contents($statusesPath, json_encode($statuses, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            return response()->json(['message' => 'Plugin activated successfully']);
        }
        return response()->json(['message' => 'Plugin not found'], 404);
    }

    public function deactivate($pluginId)
    {
        $plugin = Plugin::find($pluginId);
        if ($plugin) {
            $plugin->active = false;
            $plugin->save();

            // Sinkron ke modules_statuses.json
            $statusesPath = base_path('modules_statuses.json');
            $statuses = file_exists($statusesPath) ? json_decode(file_get_contents($statusesPath), true) : [];
            $statuses[$plugin->name] = false;
            file_put_contents($statusesPath, json_encode($statuses, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            return response()->json(['message' => 'Plugin deactivated successfully']);
        }
        return response()->json(['message' => 'Plugin not found'], 404);
    }
}