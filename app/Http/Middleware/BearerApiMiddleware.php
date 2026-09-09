<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BearerApiMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Allow if it matches the public API key
        if (hash_equals(config('services.public_api.key'), $token)) {
            return $next($request);
        }

        // Allow if it's a valid Sanctum user token
        if (auth('sanctum')->check()) {
            return $next($request);
        }

        return response()->json([
            'message' => 'Unauthorized'
        ], 401);

        return $next($request);
    }
}
