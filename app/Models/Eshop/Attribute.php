<?php

namespace App\Models\Eshop;

use Illuminate\Database\Eloquent\Model;

class Attribute extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'format_type',
        'sort_order',
        'is_active',
    ];

    public function translates()
    {
        return $this->hasMany(AttributeTranslate::class);
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
