<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Spatie\MediaLibrary\Conversions\Events\ConversionHasBeenCompleted;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(ConversionHasBeenCompleted::class, function ($event) {
            $media = $event->media;
            $originalPath = $media->getPath();
            Log::info('Conversion completed', [
                'media_id' => $media->id,
                'original' => $originalPath,
                'has_webp' => $media->hasGeneratedConversion('webp')
            ]);
            if (
                file_exists($originalPath)
                && pathinfo($originalPath, PATHINFO_EXTENSION) !== 'webp'
                && $media->hasGeneratedConversion('webp')
            ) {
                @unlink($originalPath);
                Log::info('Original file deleted', ['file' => $originalPath]);
            }
        });
    }
}
