<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;

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
    Route::resource('posts', \App\Http\Controllers\PostController::class)
        ->middleware('can:manage posts');
    Route::post('/users/bulk-change-role', [UserController::class, 'bulkChangeRole'])
        ->middleware('can:manage users')
        ->name('users.bulkChangeRole');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
