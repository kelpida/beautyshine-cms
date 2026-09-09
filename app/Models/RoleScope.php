<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoleScope extends Model
{
    protected $fillable = [
        'role_id',
        'resource_type',
        'resource_id',
    ];

    // Define relationships and any additional methods as needed
    public function role()
    {
        return $this->belongsTo(Role::class);
    }
}
