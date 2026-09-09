<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserScope extends Model
{
    protected $fillable = [
        'user_id',
        'resource_type',
        'resource_id',
        'mode'
    ];

    // Define relationships and any additional methods as needed
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
