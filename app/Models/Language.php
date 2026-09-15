<?php

namespace App\Models;

use App\Models\Eshop\EshopCategoryTranslate;
use App\Models\Eshop\ProductTranslate;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Language extends Model
{
    use SoftDeletes;

    protected $table = 'languages';

    protected $fillable = [
        'code',
        'name',
        'is_active',
        'order_id'
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('order_id', 'asc');
    }

    public function eshopCategories()
    {
        return $this->hasMany(EshopCategoryTranslate::class, 'locale', 'code');
    }

    public function eshopProducts()
    {
        return $this->hasMany(ProductTranslate::class, 'locale', 'code');
    }
}
