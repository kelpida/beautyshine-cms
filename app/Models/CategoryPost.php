<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategoryPost extends Model
{

    protected $table = "category_posts";

    protected $fillable = [
        'post_id',
        'post_category_id'
    ];

    public function post()
    {
        return $this->belongsTo(Post::class, 'post_id');
    }

    public function postCategory()
    {
        return $this->belongsTo(PostCategory::class, 'post_category_id');
    }
}
