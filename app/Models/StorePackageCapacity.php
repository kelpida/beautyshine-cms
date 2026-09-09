<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StorePackageCapacity extends Model
{
    protected $fillable = [
        "store_id",
        "package_id",
        "max_concurrent_bookings"
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
    public function package()
    {
        return $this->belongsTo(Package::class);
    }
}
