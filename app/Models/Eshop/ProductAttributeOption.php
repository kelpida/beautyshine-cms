<?php

namespace App\Models\Eshop;

use Illuminate\Database\Eloquent\Model;

class ProductAttributeOption extends Model
{
    protected $fillable = [
        'product_attribute_id',
        'name',
        'extra_price',
        'is_available',
        'sort_order',
    ];

    public function productAttribute()
    {
        return $this->belongsTo(ProductAttribute::class);
    }

    public function translates()
    {
        return $this->hasMany(ProductAttributeOptionTranslate::class);
    }
}
