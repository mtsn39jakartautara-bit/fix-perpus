<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {

        // Bukan admin
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Anda bukan admin ya');
        }

        return $next($request);
    }
}
