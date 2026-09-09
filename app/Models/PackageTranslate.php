<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PackageTranslate extends Model
{
    protected $fillable = [
        'package_id',
        'name',
        'description',
        'locale'
    ];

    public function package()
    {
        return $this->belongsTo(Package::class);
    }
}
