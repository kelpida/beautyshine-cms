<?php

namespace App\Models\Eshop;

use Illuminate\Database\Eloquent\Model;

class ProductVariation extends Model
{
    protected $fillable = [
        'product_id',
        'name',
        'sku',
        'quantity',
        'sort_description',
        'price',
        'sale_price',
        'is_available',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function variationOptions()
    {
        return $this->hasMany(ProductVariationOption::class);
    }

    public function attributeOptions()
    {
        return $this->belongsToMany(ProductAttributeOption::class, 'product_variation_options', 'product_variation_id', 'product_attribute_option_id');
    }

    public function translates()
    {
        return $this->hasMany(ProductVariationTranslate::class);
    }
}
