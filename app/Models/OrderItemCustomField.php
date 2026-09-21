<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItemCustomField extends Model
{
    protected $fillable = [
        'order_item_id',
        'field_name',
        'value',
    ];

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }
}
