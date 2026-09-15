<?php

namespace App\Models\Eshop;

use Illuminate\Database\Eloquent\Model;

class ProductVariationOption extends Model
{
    protected $fillable = [
        'product_variation_id',
        'product_attribute_option_id',
    ];

    public function productVariation()
    {
        return $this->belongsTo(ProductVariation::class);
    }

    public function productAttributeOption()
    {
        return $this->belongsTo(ProductAttributeOption::class);
    }
}
