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

    protected $appends = ['url'];

    public function getUrlAttribute(): ?string
    {
        if (!$this->path) {
            return null;
        }

        if (str_starts_with($this->path, 'http://') || str_starts_with($this->path, 'https://') || str_starts_with($this->path, '/')) {
            return $this->path;
        }

        return asset('storage/' . $this->path);
    }

    public function image()
    {
        return $this->belongsTo(UploadFile::class, 'image_id');
    }
}
