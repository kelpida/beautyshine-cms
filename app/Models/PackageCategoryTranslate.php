<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PackageCategoryTranslate extends Model
{
    protected $fillable = [
        'package_category_id',
        'name',
        'locale'
    ];

    public function packageCategory()
    {
        return $this->belongsTo(PackageCategory::class);
    }
}
