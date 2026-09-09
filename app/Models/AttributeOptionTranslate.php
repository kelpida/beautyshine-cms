<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttributeOptionTranslate extends Model
{
    protected $fillable = [
        'attribute_option_id',
        'label',
        'locale',
    ];

    public function attributeOption()
    {
        return $this->belongsTo(AttributeOptions::class);
    }
}
