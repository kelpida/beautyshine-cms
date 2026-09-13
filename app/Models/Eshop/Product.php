<?php

namespace App\Models\Eshop;

use App\Models\UploadFile;
use Illuminate\Database\Eloquent\Model;

class Product extends Model 
{
    protected $fillable = [
        'slug',
        'name',
        'description',
        'short_description',
        'main_image_id',
        'base_price',
        'sale_price',
        'product_type',
        'is_customizable',
        'status',
        'sort_order',
        'allergens_text',
        'delivery_info',
        'product_care',
        'is_active',
        'eshop_category_id',
    ];

    public function translates()
    {
        return $this->hasMany(ProductTranslate::class);
    }

    public function image()
    {
        return $this->belongsTo(UploadFile::class, 'image_id', 'id');
    }

    public function category()
    {
        return $this->belongsTo(EshopCategory::class, 'eshop_category_id', 'id');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'eshop_product_tags');
    }

    public function attributes()
    {
        return $this->belongsToMany(Attribute::class, 'eshop_product_attributes');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getTranslation($locale)
    {
        return $this->translates()->where('locale', $locale)->first();
    }
}
