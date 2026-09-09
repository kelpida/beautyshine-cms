<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Email extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'email',
        'type',
        'is_active',
    ];

    protected $dates = ['deleted_at'];


    protected $casts = [
        'is_active' => 'boolean',
    ];
    /* --------------------
     | Scopes
     |-------------------- */

    public function scopeActiveType($query, string $type)
    {
        return $query
            ->where('type', $type)
            ->where('is_active', true);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /* --------------------
     | Helpers
     |-------------------- */

    public static function getByType(string $type)
    {
        return static::type($type)->get();
    }

    public static function getActiveByType(string $type)
    {
        return static::type($type)->active()->get();
    }
}
