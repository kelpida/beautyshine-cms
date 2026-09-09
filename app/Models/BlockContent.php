<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlockContent extends Model
{
    protected $fillable = [
        'title',
        'component_name',
        'page_id',
        'content'
    ];

    protected $casts = [
        'content' => 'array'
    ];

    public function page()
    {
        return $this->belongsTo(Page::class);
    }
}
