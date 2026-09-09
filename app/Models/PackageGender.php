<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PackageGender extends Model
{
    /** @use HasFactory<\Database\Factories\PackageGenderFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'key',
        'order_id'
    ];

    public function translates()
    {
        return $this->hasMany(PackageGenderTranslate::class);
    }
}
