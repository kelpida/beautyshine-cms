<?php

namespace App\Models;

use App\Enum\OrderSourceEnum;
use App\Enum\OrderTypeEnum;
use App\Enum\PaymentMethodEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    const STATUS_PENDING = 'pending';
    const STATUS_PAID = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'client_id',
        'promo_code_id',
        'amount',
        'discount_amount',
        'total_amount',
        'status',
        'is_seen',
        'seen_at',
        'completed_at',
        'source',
        'order_type',
        'payment_method',
    ];

    protected function casts(): array
    {
        return [
            'source' => OrderSourceEnum::class,
            'order_type' => OrderTypeEnum::class,
            'payment_method' => PaymentMethodEnum::class,
        ];
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function promoCode()
    {
        return $this->belongsTo(PromoCode::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function latestTransaction()
    {
        return $this->hasOne(Transaction::class)->latestOfMany();
    }

    public function pickupDetails()
    {
        return $this->hasOne(PickupDetails::class);
    }

    public function deliveryDetails()
    {
        return $this->hasOne(DeliveryDetails::class);
    }

    // Legacy appointment relation (optional)
    public function appointments()
    {
        return $this->hasOne(OrderAppointment::class);
    }
}
