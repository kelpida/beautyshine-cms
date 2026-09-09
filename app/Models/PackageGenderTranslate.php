<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PackageGenderTranslate extends Model
{
    protected $fillable = [
        'package_gender_id',
        'language_id',
        'name'
    ];

    public function packageGender()
    {
        return $this->belongsTo(PackageGender::class);
    }

    public function language()
    {
        return $this->belongsTo(Language::class);
    }
}
