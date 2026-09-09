<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PromoCode extends Model
{
    use SoftDeletes;

    protected $table = 'promo_codes';

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    protected $fillable = [
        'code',
        'discount_type',
        'discount_value',
        'is_active',
        'has_limitation',
        'used_count',
        'max_discount_amount',
        'min_order_amount',
        'usage_limit',
        'special_user',
        'start_date',
        'end_date',
    ];
}
