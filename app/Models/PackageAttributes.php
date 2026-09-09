<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PackageAttributes extends Model
{
    protected $fillable = [
        'package_id',
        'attribute_id',
        'value',
    ];

    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }
}
