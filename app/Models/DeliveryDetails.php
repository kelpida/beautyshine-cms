<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryDetails extends Model
{
    protected $fillable = [
        'order_id',
        'delivery_address',
        'post_code',
        'city',
        'country',
        'delivery_date',
        'delivery_time',
        'delivery_price',
        'note',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

}
