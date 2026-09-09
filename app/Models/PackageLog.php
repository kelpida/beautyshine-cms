<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PackageLog extends Model
{
    protected $fillable = [
        'visitor_id',
        'client_id',
        'package_id',
        'event_type',
    ];


    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function package()
    {
        return $this->belongsTo(Package::class, 'package_id');
    }
}
