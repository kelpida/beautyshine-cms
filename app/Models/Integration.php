<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Integration extends Model
{
    protected $fillable = [
        'provider',
        'name',
        'position',
        'script',
        'enabled',
        'order_id',
    ];
}
