<?php

namespace App\Http\Controllers;

use App\Mail\GuestCheckoutCredentialsMail;
use App\Mail\PatientRegistrationMail;
use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PatientAuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => trim($validated['first_name'] . ' ' . $validated['last_name']),
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => $validated['password'],
        ]);

        $patientRole = Role::firstOrCreate(['name' => 'patient']);
        $user->roles()->syncWithoutDetaching([$patientRole->id]);

        event(new Registered($user));

        try {
            Mail::to($user->email)->send(new PatientRegistrationMail($user));
        } catch (\Throwable $exception) {
            Log::warning('Failed to send patient registration email.', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $exception->getMessage(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Account created successfully. Please verify your email before signing in.',
            'user' => $this->transformUser($user),
            'requires_verification' => true,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->hasVerifiedEmail()) {
            throw ValidationException::withMessages([
                'email' => ['Please verify your email before signing in. Check your inbox for the verification link.'],
            ]);
        }

        $token = $user->createToken('patient-web')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'token' => $token,
            'user' => $this->transformUser($user),
        ]);
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if ($user && !$user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();
        }

        return response()->json([
            'success' => true,
            'message' => 'If your email exists and is not verified, a new verification link has been sent.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        return response()->json([
            'success' => true,
            'user' => $this->transformUser($user),
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $status = Password::sendResetLink([
            'email' => $validated['email'],
        ]);

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [trans($status)],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Password reset link sent successfully.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $status = Password::reset(
            [
                'email' => $validated['email'],
                'password' => $validated['password'],
                'password_confirmation' => $request->input('password_confirmation'),
                'token' => $validated['token'],
            ],
            function (User $user) use ($validated) {
                $user->forceFill([
                    'password' => Hash::make($validated['password']),
                    'remember_token' => Str::random(60),
                    'must_change_password' => false,
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [trans($status)],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully.',
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $validated = $request->validate([
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user->forceFill([
            'password' => Hash::make($validated['password']),
            'must_change_password' => false,
            'remember_token' => Str::random(60),
        ])->save();

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
            'user' => $this->transformUser($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $token = $user ? $user->currentAccessToken() : null;

        if ($token) {
            $token->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    public function verifyEmail(Request $request, int $id, string $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            abort(403, 'Invalid verification link.');
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        $frontendUrl = rtrim(config('app.frontend_url'), '/');

        return redirect($frontendUrl . '/account?verified=1');
    }

    public function guestProvision(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'first_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
        ]);

        $email = strtolower(trim($validated['email']));
        $firstName = trim((string) ($validated['first_name'] ?? ''));
        $lastName = trim((string) ($validated['last_name'] ?? ''));

        $user = User::query()->where('email', $email)->first();
        $created = false;

        if (!$user) {
            $generatedPassword = Str::password(12);
            $nameFromEmail = Str::headline(Str::before($email, '@'));
            $fullName = trim($firstName . ' ' . $lastName);

            $user = User::create([
                'name' => $fullName !== '' ? $fullName : $nameFromEmail,
                'email' => $email,
                'password' => $generatedPassword,
                'email_verified_at' => now(),
                'must_change_password' => true,
            ]);

            $patientRole = Role::firstOrCreate(['name' => 'patient']);
            $user->roles()->syncWithoutDetaching([$patientRole->id]);

            try {
                Mail::to($user->email)->send(new GuestCheckoutCredentialsMail($user, $generatedPassword));
            } catch (\Throwable $exception) {
                Log::warning('Failed to send guest checkout credentials email.', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'error' => $exception->getMessage(),
                ]);
            }

            $created = true;
        }

        if (!$user->hasRole('patient')) {
            $patientRole = Role::firstOrCreate(['name' => 'patient']);
            $user->roles()->syncWithoutDetaching([$patientRole->id]);
        }

        if (!$user->email_verified_at) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        $token = $user->createToken('patient-web')->plainTextToken;

        return response()->json([
            'success' => true,
            'created' => $created,
            'message' => $created
                ? 'Account created, verified, and credentials email sent.'
                : 'Account found and signed in.',
            'token' => $token,
            'user' => $this->transformUser($user),
        ]);
    }

    private function transformUser(User $user): array
    {
        $parts = preg_split('/\s+/', trim($user->name), 2);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'first_name' => $parts[0] ?? '',
            'last_name' => $parts[1] ?? '',
            'email' => $user->email,
            'phone' => $user->phone,
            'must_change_password' => (bool) $user->must_change_password,
        ];
    }
}
