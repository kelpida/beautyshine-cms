<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PackageCategoryAssignee extends Model
{

    protected $fillable = [
        'package_id',
        'package_category_id',
    ];

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function packageCategory()
    {
        return $this->belongsTo(
            PackageCategory::class,
            'package_category_id'
        );
    }
}
