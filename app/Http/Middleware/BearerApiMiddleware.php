<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
        // 1. Allow authenticated Sanctum users
        if (auth('sanctum')->check()) {
            return $next($request);
        }

        $apiKey = $request->header('X-API-Key');
        $timestamp = $request->header('X-Timestamp');
        $nonce = $request->header('X-Nonce');
        $signature = $request->header('X-Signature');

        // Optional: Support simple Bearer token for backward compatibility
        $bearerToken = $request->bearerToken();
        if ($bearerToken && hash_equals((string) config('services.public_api.key'), (string) $bearerToken)) {
            return $next($request);
        }

        // Validate required headers
        if (!$apiKey || !$timestamp || !$nonce || !$signature) {
            return response()->json([
                'message' => 'Unauthorized: Missing required authentication headers',
            ], 401);
        }

        // 2. Validate API key
        $configuredKey = config('services.public_api.key');
        if (!$configuredKey || !hash_equals((string) $configuredKey, (string) $apiKey)) {
            return response()->json([
                'message' => 'Unauthorized: Invalid API key',
            ], 401);
        }

        // 3. Prevent expired requests (5-minute window for clock drift)
        if (!ctype_digit((string) $timestamp) || abs(time() - (int) $timestamp) > 300) {
            return response()->json([
                'message' => 'Unauthorized: Request timestamp expired',
            ], 401);
        }

        // 4. Prevent replay attacks using atomic Cache lock
        $nonceKey = 'api_nonce:' . hash('sha256', $apiKey . ':' . $nonce);
        if (!Cache::add($nonceKey, true, now()->addMinutes(5))) {
            return response()->json([
                'message' => 'Unauthorized: Request already used (nonce replay)',
            ], 401);
        }

        // 5. Ensure secret is configured
        $secret = config('services.public_api.secret');
        if (empty($secret)) {
            return response()->json([
                'message' => 'Server error: Public API secret is not configured',
            ], 500);
        }

        // 6. Build canonical payload including query string to prevent query tampering
        $queryString = $request->getQueryString() ?? '';
        $path = '/' . ltrim($request->path(), '/');

        $payload = implode("\n", [
            strtoupper($request->method()),
            $path,
            $queryString,
            hash('sha256', $request->getContent()),
            $timestamp,
            $nonce,
        ]);

        $expectedSignature = hash_hmac('sha256', $payload, $secret);

        if (!hash_equals($expectedSignature, $signature)) {
            return response()->json([
                'message' => 'Unauthorized: Invalid signature',
            ], 401);
        }

        return $next($request);
    }
}
