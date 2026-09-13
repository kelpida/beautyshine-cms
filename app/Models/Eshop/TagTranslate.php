<?php

namespace App\Models\Eshop;

use App\Models\Language;
use Illuminate\Database\Eloquent\Model;

class TagTranslate extends Model
{
    protected $fillable = [
        'tag_id',
        'locale',
        'name',
    ];

    public function tag()
    {
        return $this->belongsTo(Tag::class);
    }

    public function language()
    {
        return $this->belongsTo(Language::class, 'locale' , 'code');
    }
}
