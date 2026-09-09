<?php

namespace App\Http\Controllers;

use App\Models\Email;
use App\Http\Requests\Email\StoreEmailRequest;
use App\Http\Requests\Email\UpdateEmailRequest;
use App\Http\Resources\Email\EmailResource;
use Inertia\Inertia;

class EmailController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $emails = Email::all();

        return Inertia::render('Email/EmailIndexPage', [
            'emails' => EmailResource::collection($emails)
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render("Email/EmailFormPage", [
            'email' => new Email()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEmailRequest $request)
    {
        $emailValidated = $request->validated();

        Email::create($emailValidated);

        return redirect()->route('emails.index')->with('success', 'Email created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Email $email)
    {
        return Inertia::render("Email/EmailFormPage", [
            'email' => new EmailResource($email)
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Email $email)
    {
        return Inertia::render("Email/EmailFormPage", [
            'email' => new EmailResource($email)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEmailRequest $request, Email $email)
    {
        $emailValidated = $request->validated();

        $email->update($emailValidated);

        return redirect()->route('emails.index')->with('success', 'Email created successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Email $email)
    {
        //
    }
}
