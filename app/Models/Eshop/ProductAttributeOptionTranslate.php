<?php

namespace App\Models\Eshop;

use App\Models\Language;
use Illuminate\Database\Eloquent\Model;

class ProductAttributeOptionTranslate extends Model
{
    protected $fillable = [
        'product_attribute_option_id',
        'locale',
        'name',
    ];

    //relations
    public function productAttributeOption()
    {
        return $this->belongsTo(ProductAttributeOption::class);
    }

    public function language()
    {
        return $this->belongsTo(Language::class);
    }
}
