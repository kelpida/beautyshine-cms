<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UploadFile extends Model
{
    protected $fillable = [
        'name',
        'alt',
        'path',
        'type',
        'size',
        'mime_type',
        'user_id',
    ];

    public function image()
    {
        return $this->belongsTo(UploadFile::class, 'image_id');
    }
}
