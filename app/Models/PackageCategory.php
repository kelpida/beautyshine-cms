<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PackageCategory extends Model
{
    /** @use HasFactory<\Database\Factories\PackageCategoryFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'key',
        'order_id'
    ];

    public function translates()
    {
        return $this->hasMany(PackageCategoryTranslate::class);
    }

    public function packages()
    {
        return $this->belongsToMany(
            Package::class,
            'package_category_assignees',
            'package_category_id',
            'package_id'
        );
    }
}
