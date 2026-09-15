<?php

namespace App\Models\Eshop;

use Illuminate\Database\Eloquent\Model;

class ProductAddonVariation extends Model
{
    protected $fillable = [
        'product_addon_id',
        'product_variation_id',
    ];

    public function addon()
    {
        return $this->belongsTo(ProductAddon::class, 'product_addon_id');
    }

    public function productVariation()
    {
        return $this->belongsTo(ProductVariation::class, 'product_variation_id');
    }
}
