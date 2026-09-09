<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttributeTranslate extends Model
{
    protected $fillable = [
        'attribute_id',
        'name',
        'locale'
    ];

    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }
}
