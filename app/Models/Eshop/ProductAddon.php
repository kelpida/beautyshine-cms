<?php

namespace App\Models\Eshop;

use Illuminate\Database\Eloquent\Model;

class ProductAddon extends Model
{
    protected $fillable = [
        'product_id',
        'name',
        'description',
        'price',
        'sale_price',
        'quantity',
        'is_available',
        'sort_order',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function translates()
    {
        return $this->hasMany(ProductAddonTranslate::class);
    }
}
