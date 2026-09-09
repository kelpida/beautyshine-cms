<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PackageAge extends Model
{
    /** @use HasFactory<\Database\Factories\PackageAgeFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'key',
        'order_id'
    ];

    public function translates()
    {
        return $this->hasMany(PackageAgeTranslate::class);
    }
}
