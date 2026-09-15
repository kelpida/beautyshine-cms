<?php

namespace App\Models\Eshop;

use Illuminate\Database\Eloquent\Model;

class ProductCategory extends Model
{
    protected $fillable = [
        'product_id',
        'category_id',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function category()
    {
        return $this->belongsTo(EshopCategory::class, 'category_id');
    }
}
