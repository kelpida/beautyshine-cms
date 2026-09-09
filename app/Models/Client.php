<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\CanResetPassword;

class Client extends Authenticatable implements CanResetPassword
{
    use HasApiTokens, Notifiable;
    /**
     * Send the password reset notification.
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new \App\Notifications\ClientResetPasswordNotification($token, $this->email));
    }

    protected $fillable = [
        'name',
        'surname',
        'email',
        'password',
        'phone',
        'phone_code',
        'address',
        'visitor_id',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'visitor_id' => 'string',
        ];
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function clientVerfification()
    {
        return $this->hasMany(ClientVerification::class);
    }
    // public function searchLogs()
    // {
    //     return $this->hasMany(SearchLog::class, 'client_id', 'id');
    // }
}
