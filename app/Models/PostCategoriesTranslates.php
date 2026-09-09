<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostCategoriesTranslates extends Model
{
    protected $table = 'post_categories_translates';

    protected $fillable = [
        'post_category_id',
        'name',
        'description',
        'locale',
    ];

    public function postCategory()
    {
        return $this->belongsTo(PostCategory::class);
    }
}
