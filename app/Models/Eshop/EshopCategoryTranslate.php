<?php

namespace App\Models\Eshop;

use App\Models\Language;
use Illuminate\Database\Eloquent\Model;

class EshopCategoryTranslate extends Model
{
    protected $fillable = [
        'eshop_category_id',
        'locale',
        'name',
        'description',
    ];

    public function eshopCategory()
    {
        return $this->belongsTo(EshopCategory::class);
    }

    public function language()
    {
        return $this->belongsTo(Language::class, 'locale' , 'code');
    }
}
