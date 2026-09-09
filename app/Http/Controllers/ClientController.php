<?php

namespace App\Http\Controllers;

use App\Http\Requests\Client\PublicStoreClientRequest;
use App\Http\Requests\Client\StoreClientRequest;
use App\Http\Requests\Client\UpdateClientRequest;
use App\Http\Resources\Client\ClientResource;
use App\Http\Resources\Client\PublicClientResource;
use App\Http\Resources\Order\OrderResource;
use App\Http\Resources\Order\PublicOrderClientResource;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Mail;
use App\Mail\ClientRegistrationMail;
use App\Mail\ClientVerificationEmailMail;
use App\Models\ClientVerification;
use Inertia\Inertia;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $clients = Client::query();

        if ($request->filled('name')) {
            $clients->where('name', 'like', "%{$request->name}%");
        }

        if ($request->filled('surname')) {
            $clients->where('surname', 'like', "%{$request->surname}%");
        }

        if ($request->filled('phone')) {
            $clients->where('phone', 'like', "%{$request->phone}%");
        }

        if ($request->filled('email')) {
            $clients->where('email', 'like', "%{$request->email}%");
        }

        $clients->orderBy('id', 'desc');

        return Inertia::render('Clients/ClientsIndexPage', [
            'clients' => ClientResource::collection($clients->get())
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Clients/ClientsFormPage', [
            'client' => null
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreClientRequest $request)
    {
        $validatedData = $request->validated();
        $validatedData['password'] = Hash::make($validatedData['password']);

        Client::create($validatedData);

        return redirect()->route('clients.index')->with('success', 'Client created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client)
    {
        $client->load('orders');

        return Inertia::render('Clients/ClientsFormPage', [
            'client' => new ClientResource($client),
            'orders' => OrderResource::collection($client->orders),
        ]);
    }

    public function publicShow(Request $request)
    {
        $client = $request->user();

        $client->load('orders');

        return response()->json([
            'client' => new PublicClientResource($client),
            'orders' => PublicOrderClientResource::collection($client->orders),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Client $client)
    {
        $client->load('orders');

        return Inertia::render('Clients/ClientsFormPage', [
            'client' => new ClientResource($client),
            'orders' => OrderResource::collection($client->orders),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClientRequest $request, Client $client)
    {
        $validatedData = $request->validated();

        if (!empty($validatedData['password'])) {
            $validatedData['password'] = Hash::make($validatedData['password']);
        } else {
            $validatedData['password'] = $client->password;
        }

        $client->update($validatedData);

        return redirect()->route('clients.index')->with('success', 'Client updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        $client->delete();

        return back()->with('success', 'Client deleted successfully');
    }

    /**
     * Public register
     */

    public function register(PublicStoreClientRequest $request)
    {
        $data = $request->validated();

        $data['password'] = Hash::make($data['password']);

        $client = Client::create($data);

        $verificationCode = $this->generateCode();

        $verificationUrl = env('FRONTEND_URL') . "/account/verification?code=$verificationCode";

        ClientVerification::create([
            'client_id' => $client->id,
            'verification_token' => $verificationCode,
            'expires_at' => now()->addMinutes(10),
        ]);

        // Send welcome email to client
        Mail::to($client->email)->send(new ClientVerificationEmailMail($client, $verificationUrl));

        // Notify admin of new registration
        // Mail::to('info@pzalab.com.cy')->send(new \App\Mail\NewClientAdminNotificationMail($client));

        return response()->json([
            'message' => 'Registered successfully',
            'client' => new ClientResource($client),
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
            'remember' => ['nullable', 'boolean'],
        ]);

        $client = Client::where('email', $request->email)->first();

        if (!$client || !Hash::check($request->password, $client->password)) {
            return response()->json([
                'error' => 'password',
                'message' => 'Invalid credentials'
            ], 401);
        }

        if (is_null($client->email_verified_at)) {
            return response()->json([
                'error' => 'verify',
                'message' => 'Please verify your email before logging in'
            ], 403);
        }

        $expiresAt = $request->remember
            ? now()->addDays(30)
            : now()->addHours(2);

        $token = $client->createToken('client-token', ['*'], $expiresAt)->plainTextToken;

        return response()->json([
            'token' => $token,
            'client' => new PublicClientResource($client),
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email']
        ]);


        $status = Password::broker('clients')->sendResetLink(
            $request->only('email')
        );

        return response()->json([
            'message' => __($status)
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required'],
            'password' => ['required', 'confirmed', 'min:8'],
        ]);


        $status = Password::broker('clients')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($client, $password) {
                $client->forceFill([
                    'password' => Hash::make($password)
                ])->save();
            }
        );

        return response()->json([
            'message' => __($status)
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required'],
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $client = $request->user();

        if (!Hash::check($request->current_password, $client->password)) {
            return response()->json([
                'message' => 'Wrong current password'
            ], 400);
        }

        $client->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Password updated'
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out'
        ]);
    }

    public function verifyAccount(Request $request)
    {

        $verificationCode = $request->input("code");

        $verification = ClientVerification::where('verification_token', $verificationCode)->first();

        if (!$verification) {
            return response()->json([
                'success' => false,
                'message' => "Invalid verification code",
            ], 400);
        }

        // ⏳ Check expiration
        if ($verification->expires_at && $verification->expires_at < now()) {
            return response()->json([
                'success' => false,
                'message' => "Code expired",
            ], 400);
        }

        $client = Client::find($verification->client_id);

        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => "User not found",
            ], 404);
        }

        // 🚫 Already verified
        if ($client->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => "Email already verified",
            ], 400);
        }

        $client->email_verified_at = now();
        $client->save();

        // 🧹 Delete token
        $verification->delete();

        // 🔐 Auto login (Sanctum token)
        $token = $client->createToken('client-token')->plainTextToken;

        Mail::to($client->email)->send(new ClientRegistrationMail($client));

        // Notify admin of new registration
        Mail::to('info@pzalab.com.cy')->send(new \App\Mail\NewClientAdminNotificationMail($client));

        return response()->json([
            'success' => true,
            'message' => "Verification successful",
            'token' => $token, // ✅ return token
            'client' => new ClientResource($client),
        ], 200);
    }

    public function resendVerificationWeb(Client $client)
    {
        try {
            $this->resendVerification($client);

            return back()->with('success', 'Verification email sent');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function resendVerificationApi(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:clients,email'],
        ]);

        $client = Client::where('email', $request->email)->first();

        try {
            $this->resendVerification($client);

            return response()->json([
                'success' => true,
                'message' => 'Verification email sent'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    private function resendVerification(Client $client)
    {
        if ($client->email_verified_at) {
            throw new \Exception('Email already verified');
        }

        $verification = ClientVerification::where("client_id", $client->id)->first();

        if ($verification && $verification->updated_at > now()->subMinute()) {
            throw new \Exception('Please wait before requesting again');
        }

        $code = $this->generateCode();

        $url = config('app.frontend_url') . "/account/verification?code=$code";

        if ($verification) {
            $verification->update([
                'verification_token' => $code,
                'expires_at' => now()->addMinutes(10),
            ]);
        } else {
            ClientVerification::create([
                'client_id' => $client->id,
                'verification_token' => $code,
                'expires_at' => now()->addMinutes(10),
            ]);
        }

        Mail::to($client->email)
            ->send(new ClientVerificationEmailMail($client, $url));
    }

    function generateCode($length = 9)
    {
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        return substr(str_shuffle($chars), 0, $length);
    }
}
