<?php

namespace App\Models\Eshop;

use Illuminate\Database\Eloquent\Model;

class ProductCustomFieldTranslate extends Model
{
    protected $fillable = [
        'product_custom_field_id',
        'locale',
        'name',
    ];

    public function productCustomField()
    {
        return $this->belongsTo(ProductCustomField::class);
    }
}
