<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientVerification extends Model
{
    protected $fillable = [
        'client_id',
        'verification_token',
        'expires_at',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
