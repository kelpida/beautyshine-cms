<?php

namespace App\Models\Eshop;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'sort_order',
        'is_active',
    ];

    public function translates()
    {
        return $this->hasMany(TagTranslate::class);
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
