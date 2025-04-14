<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PostController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // User management routes
    Route::resource('users', \App\Http\Controllers\UserController::class)
        ->middleware('can:manage users');
    Route::resource('roles', \App\Http\Controllers\RoleController::class)
        ->middleware('can:manage roles');
    Route::resource('permissions', \App\Http\Controllers\PermissionController::class)
        ->middleware('can:manage permissions');
    Route::resource('categories', \App\Http\Controllers\CategoryController::class)
        ->middleware('can:manage posts');
    Route::resource('tags', \App\Http\Controllers\TagController::class)
        ->middleware('can:manage posts');

    // Media Library routes
    Route::prefix('posts')->name('posts.')->group(function () {
        Route::get('media-library', [PostController::class, 'mediaLibrary'])
            ->middleware('can:manage posts')
            ->name('media.library');
        Route::post('media-library/upload', [PostController::class, 'uploadMedia'])
            ->middleware('can:manage posts')
            ->name('media.upload');
    });
    
    // Posts routes with status and revision management
    Route::middleware('can:manage posts')->group(function () {
        Route::resource('posts', PostController::class);
        Route::post('/posts/{post}/status', [PostController::class, 'updateStatus'])->name('posts.status');
        Route::post('/posts/{post}/restore', [PostController::class, 'restore'])->name('posts.restore');
        Route::get('/posts/{post}/revisions', [PostController::class, 'revisions'])->name('posts.revisions');
    });

    Route::post('/posts/{post}/revisions/{revision}/restore', [\App\Http\Controllers\PostController::class, 'restoreRevision'])
        ->middleware('can:manage posts')
        ->name('posts.revisions.restore');

    Route::get('/media-library', [\App\Http\Controllers\PostController::class, 'mediaLibrary'])
        ->middleware('can:manage posts')
        ->name('media.library');
    Route::post('/users/bulk-change-role', [UserController::class, 'bulkChangeRole'])
        ->middleware('can:manage users')
        ->name('users.bulkChangeRole');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
