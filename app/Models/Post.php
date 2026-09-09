<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    protected $fillable = [
        'title',
        'path',
        'content',
        'author_id',
        'image_id',
    ];

    public function image(): BelongsTo
    {
        return $this->belongsTo(UploadFile::class, 'image_id');
    }

    public function categories()
    {
        return $this->belongsToMany(PostCategory::class, 'category_posts', 'post_id', 'post_category_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function seoMeta()
    {
        return $this->morphOne(SeoMeta::class, 'metaable');
    }
}
