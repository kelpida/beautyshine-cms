<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostCategory extends Model
{
    protected $table = "post_categories";

    protected $fillable = [
        'name',
        'path',
        'description',
        'parent_id'
    ];

    public function posts()
    {
        return $this->belongsToMany(Post::class, 'category_post', 'post_category_id', 'post_id');
    }

    public function parent()
    {
        return $this->belongsTo(PostCategory::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(PostCategory::class, 'parent_id');
    }

    public function seoMeta()
    {
        return $this->morphOne(SeoMeta::class, 'metaable');
    }

    public function translates()
    {
        return $this->hasMany(PostCategoriesTranslates::class);
    }
}
