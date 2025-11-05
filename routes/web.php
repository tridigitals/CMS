<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\DashboardController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Admin routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/users', function () {
            return Inertia::render('admin.users');
        })->name('admin.users');
    });
    
    // Operator routes
    Route::middleware('role:operator|admin')->prefix('operator')->group(function () {
        Route::get('/customers', function () {
            return Inertia::render('operator.customers');
        })->name('operator.customers');
    });
});

require __DIR__.'/settings.php';
