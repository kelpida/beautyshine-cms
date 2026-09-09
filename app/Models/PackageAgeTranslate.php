<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PackageAgeTranslate extends Model
{
    protected $fillable = [
        'package_age_id',
        'language_id',
        'name'
    ];

    public function packageAge()
    {
        return $this->belongsTo(PackageAge::class);
    }

    public function language()
    {
        return $this->belongsTo(Language::class);
    }
}
