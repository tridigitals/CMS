<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        return Inertia::render('dashboard', [
            'user' => $user,
            'roles' => $user->roles,
            'permissions' => $user->permissions,
        ]);
    }
}
