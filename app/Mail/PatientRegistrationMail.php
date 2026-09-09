<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PatientRegistrationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function envelope(): Envelope
    {
        return new Envelope('P.Z. Agapiou | Welcome to Your Patient Account');
    }

    public function content(): Content
    {
        return new Content(null, null, null, 'emails.patient-registration');
    }

    public function attachments(): array
    {
        return [];
    }
}
