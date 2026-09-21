<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PickupDetails extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'order_id',
        'pickup_date',
        'pickup_time',
        'note',
        'store_id',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}
