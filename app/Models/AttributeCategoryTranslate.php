<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttributeCategoryTranslate extends Model
{
    protected $fillable = [
        'attribute_category_id',
        'name',
        'locale'
    ];

    public function attributeCategory()
    {
        return $this->belongsTo(AttributeCategory::class);
    }
}
