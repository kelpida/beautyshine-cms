<?php

namespace App\Models\Eshop;

use App\Models\UploadFile;
use Illuminate\Database\Eloquent\Model;

class EshopCategory extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'description',
        'sort_order',
        'is_active',
        'parent_id',
        'image_id',      
    ];

    public function translates()
    {
        return $this->hasMany(EshopCategoryTranslate::class);
    }

    public function image()
    {
        return $this->belongsTo(UploadFile::class, 'image_id', 'id');
    }

    public function parent()
    {
        return $this->belongsTo(EshopCategory::class, 'parent_id', 'id');
    }

    public function children()
    {
        return $this->hasMany(EshopCategory::class, 'parent_id', 'id');
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
