<?php

use Illuminate\Support\Facades\Route;
use Modules\Page\Http\Controllers\PageController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('page', PageController::class)->names('page');
});
