<?php

namespace App\Http\Controllers;

use App\Http\Requests\Role\RoleRequest;
use App\Http\Resources\Role\PermissionResource;
use App\Http\Resources\Role\RoleResource;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RolesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Roles/RoleIndexPage', [
            'roles' => Role::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $permissions = Permission::all();

        $permissionsResource = PermissionResource::collection($permissions);
        return Inertia::render('Roles/RoleFormPage', [
            'role' => null,
            'permissions' => $permissionsResource
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(RoleRequest $request)
    {
        $validated = $request->validated();

        $role = Role::create([
            'name' => $validated['name'],
        ]);

        $permissionIds = collect($validated['permissions'])->pluck('id')->toArray();

        $role->permissions()->sync($permissionIds);

        if (isset($validated['scope'])) {
            foreach ($validated['scope'] as $scopeData) {
                $role->roleScopes()->create([
                    'resource_type' => $scopeData['resource_type'],
                    'resource_id' => $scopeData['resource_id'] ?? null,
                ]);
            }
        }

        return redirect()->route('roles.index')
            ->with('success', 'Role created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $role = Role::with('permissions', 'roleScopes')->findOrFail($id);
        $roleResource = new RoleResource($role);
        $permissions = Permission::all();
        $permissionsResource = PermissionResource::collection($permissions);
        return Inertia::render('Roles/RoleFormPage', [
            'role' => $roleResource,
            'permissions' => $permissionsResource
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(RoleRequest $request, Role $role)
    {
        $validated = $request->validated();

        $role->update([
            'name' => $validated['name']
        ]);

        $permissionIds = collect($validated['permissions'] ?? [])
            ->map(fn($p) => is_array($p) ? ($p['id'] ?? null) : $p)
            ->filter()
            ->unique()
            ->values()
            ->toArray();

        if ($request->has('permissions')) {
            $role->permissions()->sync($permissionIds);
        }

        $role->roleScopes()->delete();

        if (!empty($validated['scope'])) {
            foreach ($validated['scope'] as $scope) {
                if (!empty($scope['resource_type'])) {
                    $role->roleScopes()->create([
                        'resource_type' => $scope['resource_type'],
                        'resource_id' => $scope['resource_id'] ?? null,
                    ]);
                }
            }
        }

        return redirect()->route('roles.index')
            ->with('success', 'Role updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
