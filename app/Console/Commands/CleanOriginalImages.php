<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanOriginalImages extends Command
{
    protected $signature = 'media:clean-originals';
    protected $description = 'Delete all non-webp original images from media storage.';

    public function handle()
    {
        $disk = \Storage::disk('public');
        $basePath = '';
        $deleted = 0;

        $dirs = $disk->directories($basePath);
        foreach ($dirs as $dir) {
            // skip if not numeric (media id)
            if (!is_numeric(basename($dir))) continue;
            $files = $disk->allFiles($dir);
            foreach ($files as $file) {
                // skip conversions folder
                if (str_contains($file, '/conversions/')) continue;
                // skip webp
                if (str_ends_with($file, '.webp')) continue;
                $disk->delete($file);
                $this->line('Deleted: ' . $file);
                $deleted++;
            }
        }
        $this->info("Deleted $deleted original image(s).");
        return 0;
    }
}
