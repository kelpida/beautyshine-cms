<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if (!$user) {
            abort(403);
        }

        $user->load('roles.permissions');

        // 🔑 Super admin bypass
        if ($user->hasRole('super-admin')) {
            return $next($request);
        }

        $permission = $this->permissionFromRoute($request);

        if ($user->hasPermission($permission)) {
            return $next($request);
        }

        abort(403, "Missing permission: {$permission}");
    }

    protected function permissionFromRoute(Request $request): string
    {
        $routeName = $request->route()?->getName();

        if (!$routeName || !str_contains($routeName, '.')) {
            abort(403);
        }

        [$resource, $action] = explode('.', $routeName, 2);

        // Laravel action → permission action
        $actionMap = [
            'index'   => 'index',
            'show'    => 'view',
            'create'  => 'store',
            'store'   => 'store',
            'edit'    => 'edit',
            'update'  => 'edit',
            'destroy' => 'destroy',
        ];

        if (!isset($actionMap[$action])) {
            abort(403);
        }

        // 🔑 FIX: singularize resource name
        $resource = Str::singular(str_replace('_', '-', $resource));

        return "{$actionMap[$action]}-{$resource}";
    }
}
