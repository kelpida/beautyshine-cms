<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class VivaWalletOrder extends Model
{
    use SoftDeletes;

    protected $table = 'viva_wallet_orders';

    protected $fillable = [
        'package_id',
        'user_id',
        'email',
        'first_name',
        'last_name',
        'phone',
        'country',
        'appointment_date',
        'appointment_time',
        'sampling_centre',
        'quantity',
        'amount',
        'currency',
        'viva_wallet_order_ref',
        'viva_wallet_transaction_id',
        'payment_status',
        'result_status',
        'result_reference',
        'result_received_at',
        'result_payload',
        'payment_date',
        'viva_wallet_response',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'appointment_date' => 'date',
        'appointment_time' => 'string',
        'quantity' => 'integer',
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'result_received_at' => 'datetime',
        'result_payload' => 'array',
        'viva_wallet_response' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function isPending(): bool
    {
        return $this->payment_status === 'pending';
    }

    public function isCompleted(): bool
    {
        return $this->payment_status === 'completed';
    }

    public function isFailed(): bool
    {
        return $this->payment_status === 'failed';
    }
}
