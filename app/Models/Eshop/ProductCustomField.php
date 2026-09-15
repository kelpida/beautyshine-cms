<?php

namespace App\Models\Eshop;

use Illuminate\Database\Eloquent\Model;

class ProductCustomField extends Model
{
    protected $fillable = [
        'product_id',
        'name',
        'key',
        'field_type',
        'is_required',
        'max_length',
        'sort_order',
        'is_active',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }

    public function translates()
    {
        return $this->hasMany(ProductCustomFieldTranslate::class);
    }
}
