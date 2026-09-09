<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderAppointment extends Model
{

    const STATUS_PENDING = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    protected $fillable = [
        'order_id',
        'store_id',
        'date',
        'start_time',
        'end_time',
        'duration',
        'status',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the packages for this appointment through the order's items.
     *
     * order_appointments → orders → order_items → packages
     */
    public function packages()
    {
        return $this->hasManyThrough(
            Package::class,
            OrderItem::class,
            'order_id',  // FK on order_items pointing to orders
            'id',        // PK on packages
            'order_id',  // FK on order_appointments pointing to orders
            'package_id' // FK on order_items pointing to packages
        );
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}
