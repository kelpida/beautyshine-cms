<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreTranslate extends Model
{
    protected $fillable = [
        'store_id',
        'locale',
        'name',
        'address',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}
