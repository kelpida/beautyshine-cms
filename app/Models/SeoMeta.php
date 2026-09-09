<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoMeta extends Model
{
    protected $fillable = [
        'meta_title',
        'meta_description',
        'image_id',
        'metaable_id',
        'metaable_type',
    ];

    public function metaable()
    {
        return $this->morphTo();
    }

    public function image()
    {
        return $this->belongsTo(UploadFile::class, 'image_id');
    }
}
