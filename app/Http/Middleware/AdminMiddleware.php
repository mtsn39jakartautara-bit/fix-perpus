<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Inertia\Inertia;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Jika belum login
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        // Bukan admin
        if (auth()->user()->role !== 'admin') {
            return redirect()->route('dashboard.index');
        }

        return $next($request);
    }
}
