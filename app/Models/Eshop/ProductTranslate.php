<?php

namespace App\Models\Eshop;

use App\Models\Language;
use Illuminate\Database\Eloquent\Model;

class ProductTranslate extends Model
{
    protected $fillable = [
        'product_id',
        'locale',
        'name',
        'description',
        'short_description',
        'allergens_text',
        'delivery_info',
        'product_care',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function language()
    {
        return $this->belongsTo(Language::class, 'locale', 'code');
    }
}
