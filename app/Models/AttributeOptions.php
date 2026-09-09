<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttributeOptions extends Model
{
    protected $fillable = [
        'attribute_id',
        'value',
        'label',
        'order_id',
    ];

    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }

    public function optionTranslates()
    {
        return $this->hasMany(AttributeOptionTranslate::class, 'attribute_option_id');
    }
}
