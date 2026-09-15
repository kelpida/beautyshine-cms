<?php

namespace App\Models\Eshop;

use App\Models\Language;
use Illuminate\Database\Eloquent\Model;

class ProductVariationTranslate extends Model
{
    protected $fillable = [
        'product_variation_id',
        'locale',
        'name',
        'short_description',
    ];

    public function productVariation()
    {
        return $this->belongsTo(ProductVariation::class);
    }

    public function language()
    {
        return $this->belongsTo(Language::class);
    }
    
}
