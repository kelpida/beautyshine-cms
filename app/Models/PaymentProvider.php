<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentProvider extends Model
{
    use SoftDeletes;

    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';

    const CODE_VIVA = 'viva';
    const CODE_STRIPE = 'stripe';
    const CODE_JCC = 'jcc';
    const CODE_REVOLUT = 'revolut';

    protected $fillable = [
        'name',
        'code',
        'description',
        'status',
        'logo_id',
        'is_production',
        'merchant_id',
        'api_key',
        'client_id',
        'client_secret',
        'source_code',
        'public_key',
        'secret_key',
        'webhook_secret',
        'acquirer_id',
        'signature_key',
        'credentials',
    ];

    protected function casts(): array
    {
        return [
            'is_production' => 'boolean',
            'credentials' => 'array',
        ];
    }

    public function logo()
    {
        return $this->belongsTo(UploadFile::class, 'logo_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }
}
