<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = [
        'name',
        'code',
    ];

    public function permissions()
    {
        return $this->belongsToMany(Permission::class);
    }

    public function hasPermission($permissionName)
    {
        return $this->permissions->contains('name', $permissionName);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_roles');
    }

    public function roleScopes()
    {
        return $this->hasMany(RoleScope::class);
    }
}
