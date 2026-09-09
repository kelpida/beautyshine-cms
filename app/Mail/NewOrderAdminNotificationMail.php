<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewOrderAdminNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $client;

    public function __construct($order, $client)
    {
        $this->order = $order;
        $this->client = $client;
    }

    public function build()
    {
        return $this->subject('New Order Placed')
            ->view('emails.admin-new-order');
    }
}
