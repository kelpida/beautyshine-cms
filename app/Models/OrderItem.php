<?php

namespace App\Models;

use App\Models\Eshop\Product;
use App\Models\Eshop\ProductVariation;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'variation_id',
        'product_name',
        'variation_name',
        'price',
        'quantity',
        'total_price',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function variation()
    {
        return $this->belongsTo(ProductVariation::class, 'variation_id');
    }

    public function options()
    {
        return $this->hasMany(OrderItemOption::class);
    }

    public function customFields()
    {
        return $this->hasMany(OrderItemCustomField::class);
    }


}
