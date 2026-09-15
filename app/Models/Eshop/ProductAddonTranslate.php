<?php

namespace App\Models\Eshop;

use Illuminate\Database\Eloquent\Model;

class ProductAddonTranslate extends Model
{
    protected $fillable = [
        'product_addon_id',
        'locale',
        'name',
        'description',
    ];

    public function productAddon()
    {
        return $this->belongsTo(ProductAddon::class, 'product_addon_id');
    }
}
