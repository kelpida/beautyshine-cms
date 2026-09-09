<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttributeCategory extends Model
{
    protected $fillable = [
        'name',
        'key',
        'order_id'
    ];

    public function translates()
    {
        return $this->hasMany(AttributeCategoryTranslate::class);
    }

    public function attributes()
    {
        return $this->hasMany(Attribute::class);
    }

    public function packages()
    {
        return $this->belongsToMany(Package::class, 'package_attribute_categories');
    }
}
