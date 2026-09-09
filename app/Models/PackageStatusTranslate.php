<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PackageStatusTranslate extends Model
{
    protected $fillable = [
        'package_status_id',
        'name',
        'locale'
    ];

    public function packageStatus()
    {
        return $this->belongsTo(PackageStatus::class);
    }
}
