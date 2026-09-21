<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItemOption extends Model
{
    protected $fillable = [
        'order_item_id',
        'attribute_name',
        'option_name',
        'price_modifier',
    ];

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }
}
