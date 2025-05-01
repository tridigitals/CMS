<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\MediaController;

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
    Route::prefix('media')->name('media.')->group(function () {
        Route::get('/', [MediaController::class, 'index'])
            ->middleware('can:manage posts')
            ->name('index');
        Route::get('/meta-fields', [MediaController::class, 'getForMetaFields'])
            ->middleware('can:manage posts')
            ->name('meta-fields');
        Route::post('upload', [MediaController::class, 'upload'])
            ->middleware('can:manage posts')
            ->name('upload');
        Route::put('{media}', [MediaController::class, 'update'])
            ->middleware('can:manage posts')
            ->name('update');
        Route::delete('{media}', [MediaController::class, 'destroy'])
            ->middleware('can:manage posts')
            ->name('destroy');
    });
    
    // Posts routes with revision management
    Route::middleware('can:manage posts')->group(function () {
        Route::resource('posts', PostController::class);
        Route::post('/posts/{post}/restore', [PostController::class, 'restore'])->name('posts.restore');
        Route::delete('/posts/{post}/force-delete', [PostController::class, 'forceDelete'])->name('posts.forceDelete');
        Route::get('/posts/{post}/revisions', [PostController::class, 'revisions'])->name('posts.revisions');
    });

    Route::post('/posts/{post}/revisions/{revision}/restore', [\App\Http\Controllers\PostController::class, 'restoreRevision'])
        ->middleware('can:manage posts')
        ->name('posts.revisions.restore');

    // Pages routes
    Route::middleware('can:manage pages')->group(function () {
        Route::resource('pages', PageController::class);
        Route::post('/pages/{page}/restore', [PageController::class, 'restore'])->name('pages.restore');
        Route::delete('/pages/{page}/force-delete', [PageController::class, 'forceDelete'])->name('pages.forceDelete');
        Route::post('/pages/{page}/status', [PageController::class, 'updateStatus'])->name('pages.updateStatus');
    });

    // Comment routes
    Route::prefix('comments')->name('comments.')->group(function () {
        Route::middleware('auth')->group(function () {
            Route::post('/posts/{post}', [\App\Http\Controllers\CommentController::class, 'store'])->name('store');
            Route::get('/{comment}', [\App\Http\Controllers\CommentController::class, 'show'])->name('show');
            Route::put('/{comment}', [\App\Http\Controllers\CommentController::class, 'update'])->name('update');
            Route::delete('/{comment}', [\App\Http\Controllers\CommentController::class, 'destroy'])->name('destroy');
        });

        Route::middleware(['auth', 'can:manage posts'])->group(function () {
            Route::get('/', [\App\Http\Controllers\CommentController::class, 'index'])->name('index');
            Route::get('/moderation', [\App\Http\Controllers\CommentController::class, 'moderation'])->name('moderation');
            Route::match(['put', 'patch'], '/{comment}/moderate', [\App\Http\Controllers\CommentController::class, 'moderate'])->name('moderate');
        });
    });

    Route::get('/media-library', [\App\Http\Controllers\PostController::class, 'mediaLibrary'])
        ->middleware('can:manage posts')
        ->name('media.library');
    Route::post('/users/bulk-change-role', [UserController::class, 'bulkChangeRole'])
        ->middleware('can:manage users')
        ->name('users.bulkChangeRole');

    // Menu Management routes
    Route::resource('menus', \App\Http\Controllers\MenuController::class)->middleware('can:manage menus');
    Route::get('menu-sources', [\App\Http\Controllers\MenuItemController::class, 'getSources'])->middleware('can:manage menus');
    Route::get('menus/{menu}/items', [\App\Http\Controllers\MenuItemController::class, 'getItems'])->middleware('can:manage menus');
    Route::post('menu-items', [\App\Http\Controllers\MenuItemController::class, 'store'])->middleware('can:manage menus');
    Route::post('menu-items/{menuItem}/move', [\App\Http\Controllers\MenuItemController::class, 'move'])->middleware('can:manage menus');
    Route::delete('menu-items/{menuItem}', [\App\Http\Controllers\MenuItemController::class, 'destroy'])->middleware('can:manage menus');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
