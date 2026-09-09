<?php

namespace App\Models;

use App\Notifications\PatientResetPasswordNotification;
use App\Notifications\PatientVerifyEmailNotification;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Auth\MustVerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail as MustVerifyEmailContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmailContract
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, MustVerifyEmail;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'social_provider',
        'social_provider_id',
        'password',
        'must_change_password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'must_change_password' => 'boolean',
        ];
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    public function getRoleAttribute()
    {
        return $this->roles->first();
    }

    public function hasRole(string $role): bool
    {
        return $this->roles->contains('name', $role);
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->hasRole('super-admin')) {
            return true;
        }

        return $this->roles->contains(
            fn($role) => $role->permissions->contains('name', $permission)
        );
    }

    public function getAllPermissions()
    {
        if ($this->hasRole('super-admin')) {
            return Permission::pluck('name');
        }

        return $this->roles
            ->flatMap(fn($role) => $role->permissions->pluck('name'))
            ->unique()
            ->values();
    }

    public function userScopes()
    {
        return $this->hasMany(UserScope::class);
    }
    public function userRoles()
    {
        return $this->hasMany(UserRoles::class);
    }


    public function getEffectiveScopes()
    {
        $this->loadMissing(['roles.roleScopes', 'userScopes']);

        $roleScopes = $this->roles
            ->flatMap(fn($role) => $role->roleScopes)
            ->map(fn($s) => [
                'resource_type' => $s->resource_type,
                'resource_id'   => $s->resource_id,
                'mode'          => $s->mode ?? 'allow',
            ]);

        $userScopes = $this->userScopes
            ->map(fn($s) => [
                'resource_type' => $s->resource_type,
                'resource_id'   => $s->resource_id,
                'mode'          => $s->mode,
            ]);

        // user overrides role
        return $roleScopes
            ->keyBy(fn($s) => "{$s['resource_type']}:{$s['resource_id']}")
            ->merge(
                $userScopes->keyBy(fn($s) => "{$s['resource_type']}:{$s['resource_id']}")
            )
            ->values();
    }

    public function canAccess(string $resourceType, ?int $resourceId): bool
    {
        // Super admin bypass
        if ($this->hasRole('super-admin')) {
            return true;
        }

        $scopes = $this->getEffectiveScopes()
            ->where('resource_type', $resourceType);

        // No scopes → full access
        if ($scopes->isEmpty()) {
            return true;
        }

        // Check exact match
        foreach ($scopes as $scope) {
            if (
                $scope->resource_id === null ||
                $scope->resource_id === $resourceId
            ) {
                return $scope->mode !== 'deny';
            }
        }

        return false;
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new PatientResetPasswordNotification($token));
    }

    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new PatientVerifyEmailNotification());
    }
}
