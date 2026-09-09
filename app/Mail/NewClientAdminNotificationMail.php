<?php

namespace App\Mail;

use App\Models\Client;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewClientAdminNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $client;

    public function __construct(Client $client)
    {
        $this->client = $client;
    }
    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('New Client Registration Notification')
                    ->view('emails.admin-new-client');
    }
}
