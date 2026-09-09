<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;

class Page extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'title',
        'page_name',
        'path'
    ];

    public function seoMeta()
    {
        return $this->morphOne(SeoMeta::class, 'metaable');
    }

    public function blockContents()
    {
        return $this->hasMany(BlockContent::class);
    }
}
