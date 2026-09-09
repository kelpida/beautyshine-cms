<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attribute extends Model
{
    protected $fillable = [
        'name',
        'key',
        'type',
        'format',
        'icon',
        'order_id',
        'is_featured',
        'is_required',
        'attribute_category_id'
    ];

    public function translates()
    {
        return $this->hasMany(AttributeTranslate::class);
    }

    public function attributeCategory()
    {
        return $this->belongsTo(AttributeCategory::class);
    }

    public function options()
    {
        return $this->hasMany(AttributeOptions::class);
    }

    public function optionTranslates()
    {
        return $this->hasMany(AttributeOptionTranslate::class);
    }
}
