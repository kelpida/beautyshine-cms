<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ClientResetPasswordNotification extends Notification
{
    use Queueable;

    public $token;
    public $email;

    public function __construct($token, $email)
    {
        $this->token = $token;
        $this->email = $email;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $resetUrl = config('app.frontend_url') . '/account/reset-password?token=' . $this->token . '&email=' . urlencode($this->email);
        return (new MailMessage)
            ->subject('Reset Your Password')
            ->view('emails.patient-reset-password', [
                'resetUrl' => $resetUrl,
                'user' => $notifiable,
            ]);
    }
}
