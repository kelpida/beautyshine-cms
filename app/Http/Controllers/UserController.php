<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\User\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\HttpCache\Store;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::where('id', '!=', 1)->with('userRoles')->paginate(10);
        return Inertia::render('Users/UserIndexPage', [
            'users' => UserResource::collection($users),
        ]);
    }

    public function patients()
    {
        $patients = User::whereHas('roles', function ($query) {
            $query->where('name', 'patient');
        })->get();

        return Inertia::render('Users/UserIndexPage', [
            'users' => $patients,
            'title' => 'Patients',
            'addAction' => null,
            'addName' => null,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = null;
        $roles = Role::all();
        return Inertia::render('Users/UserFormPage', [
            'roles' => $roles,
            'user' => $user,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        // Validate the request data
        $validatedData = $request->validated();

        // Create the user
        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' =>  Hash::make($validatedData['password']),
        ]);

        // Assign roles to the user if provided
        if (isset($validatedData['role_id'])) {
            $user->roles()->sync([$validatedData['role_id']]);
        }

        // Assign scopes to the user if provided
        if (isset($validatedData['scope'])) {
            foreach ($validatedData['scope'] as $scopeData) {
                if (empty($scopeData['resource_type'])) {
                    continue; // Skip if resource_type is empty
                }
                $user->userScopes()->create([
                    'resource_type' => $scopeData['resource_type'],
                    'resource_id' => $scopeData['resource_id'] ?? null,
                    'mode' => $scopeData['mode'],
                ]);
            }
        }

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        $user->load('userRoles', 'userScopes');

        return Inertia::render('Users/UserFormPage', [
            'user' => UserResource::make($user),
            'roles' => Role::all()
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        $user->load('userRoles', 'userScopes');

        return Inertia::render('Users/UserFormPage', [
            'user' => $user,
            'roles' => Role::all()
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $validatedData = $request->validated();

        $user->update([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
        ]);

        if (isset($validatedData['password'])) {
            $user->update([
                'password' => Hash::make($validatedData['password']),
            ]);
        }

        if (isset($validatedData['role_id'])) {
            $user->roles()->sync([$validatedData['role_id']]);
        }

        if (isset($validatedData['scope'])) {
            // Clear existing scopes
            $user->userScopes()->delete();

            foreach ($validatedData['scope'] as $scopeData) {
                $user->userScopes()->create([
                    'resource_type' => $scopeData['resource_type'],
                    'resource_id' => $scopeData['resource_id'] ?? null,
                    'mode' => $scopeData['mode'],
                ]);
            }
        }

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'reassign_to' => 'required|exists:users,id'
        ]);

        $newOwnerId = $request->reassign_to;

        // TODO: Reassign user's related data here if needed
        // Example: Package::where('user_id', $user->id)->update(['user_id' => $newOwnerId]);

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User deleted and data reassigned successfully.');
    }


    public function impersonate(User $user)
    {
        if (auth()->id() === $user->id) {
            return back();
        }

        if ($user->hasRole('superadmin')) {
            abort(403);
        }

        session(['impersonator_id' => auth()->id()]);

        auth()->login($user);

        return redirect()->route('dashboard');
    }


    public function leaveImpersonation()
    {
        if (!session()->has('impersonator_id')) {
            return redirect()->route('dashboard');
        }

        $adminId = session('impersonator_id');

        auth()->loginUsingId($adminId);

        session()->forget('impersonator_id');

        return redirect()->route('dashboard');
    }
}
