<?php

namespace App\Models;

use App\Enum\OrderSourceEnum;
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
        'payment_method',
    ];

    protected function casts(): array
    {
        return [
            'order_source' => OrderSourceEnum::class,
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

    public function appointments()
    {
        return $this->hasOne(OrderAppointment::class);
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
}
