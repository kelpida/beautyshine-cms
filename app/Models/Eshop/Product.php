<?php

namespace App\Models\Eshop;

use App\Models\UploadFile;
use App\Models\SeoMeta;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model 
{
    use SoftDeletes;

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

    public function mainImage()
    {
        return $this->belongsTo(UploadFile::class, 'main_image_id', 'id');
    }

    // backward compatibility
    public function image()
    {
        return $this->belongsTo(UploadFile::class, 'main_image_id', 'id');
    }

    public function galleryImages()
    {
        return $this->belongsToMany(UploadFile::class, 'product_images', 'product_id', 'upload_file_id')
            ->withPivot('sort_order')
            ->orderBy('product_images.sort_order');
    }

    public function productImages()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function categories()
    {
        return $this->belongsToMany(EshopCategory::class, 'product_categories', 'product_id', 'category_id');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'product_tags', 'product_id', 'tag_id');
    }

    public function productAttributes()
    {
        return $this->hasMany(ProductAttribute::class)->with(['attribute', 'options.translates']);
    }

    public function variations()
    {
        return $this->hasMany(ProductVariation::class)->with(['attributeOptions', 'translates']);
    }

    public function addons()
    {
        return $this->hasMany(ProductAddon::class)->with('translates');
    }

    public function customFields()
    {
        return $this->hasMany(ProductCustomField::class)->with('translates');
    }

    public function seo()
    {
        return $this->morphOne(SeoMeta::class, 'metaable');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getTranslation($locale)
    {
        return $this->translates()->where('locale', $locale)->first();
    }

    public static function nextSortOrder(): int
    {
        return (static::max('sort_order') ?? 0) + 1;
    }

    protected static function booted()
    {
        static::creating(function ($model) {
            if ($model->sort_order === null) {
                $model->sort_order = static::nextSortOrder();
            }
        });
    }
}
