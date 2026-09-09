<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        if ($user) {
            $user->load([
                'roles.permissions',
                'roles.roleScopes',
                'userScopes',
            ]);
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,

                    'role' => $user->role
                        ? [
                            'id' => $user->role->id,
                            'name' => $user->role->name,
                        ]
                        : null,

                    'permissions' => $user->getAllPermissions(),

                    'scopes' => [
                        'role' => $user->roles
                            ->flatMap(fn($role) => $role->roleScopes)
                            ->map(fn($scope) => [
                                'resource_type' => $scope->resource_type,
                                'resource_id'   => $scope->resource_id,
                            ])
                            ->values(),

                        'user' => $user->userScopes->map(fn($scope) => [
                            'resource_type' => $scope->resource_type,
                            'resource_id'   => $scope->resource_id,
                            'mode'          => $scope->mode,
                        ]),
                    ],
                ] : null,
                'impersonator_id' => session('impersonator_id'),
            ],

            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error'   => fn() => $request->session()->get('error'),
            ],
        ]);
    }
}
