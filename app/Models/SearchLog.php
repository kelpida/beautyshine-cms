<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SearchLog extends Model
{
    protected $fillable = [
        'visitor_id',
        'client_id',
        'filter',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }
}
