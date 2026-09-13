<?php

namespace App\Models\Eshop;

use App\Models\Language;
use Illuminate\Database\Eloquent\Model;

class AttributeTranslate extends Model
{
    protected $fillable = [
        'attribute_id',
        'locale',
        'name',
    ];

    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }

    public function language()
    {
        return $this->belongsTo(Language::class, 'locale' , 'code');
    }
}
