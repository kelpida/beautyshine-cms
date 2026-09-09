<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Store extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'address',
        'phone',
        'phone_code',
        'fax',
        'email',
        'map_url',
        'is_active',
    ];

    public function storeHours()
    {
        return $this->hasMany(StoreHour::class);
    }

    public function translations()
    {
        return $this->hasMany(StoreTranslate::class);
    }

    public function holidays()
    {
        return $this->hasMany(Holiday::class);
    }

    public function storeCapacity()
    {
        return $this->hasMany(StorePackageCapacity::class);
    }

    public function storeAppointments()
    {
        return $this->hasMany(OrderAppointment::class);
    }
}
