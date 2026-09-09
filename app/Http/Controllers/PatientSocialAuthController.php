<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class PatientSocialAuthController extends Controller
{
    private const ALLOWED_PROVIDERS = ['google', 'apple'];

    public function redirect(string $provider): RedirectResponse
    {
        if (!in_array($provider, self::ALLOWED_PROVIDERS, true)) {
            return $this->redirectWithError('Unsupported social provider.');
        }

        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function callback(string $provider): RedirectResponse
    {
        if (!in_array($provider, self::ALLOWED_PROVIDERS, true)) {
            return $this->redirectWithError('Unsupported social provider.');
        }

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Throwable $exception) {
            return $this->redirectWithError('Unable to authenticate with ' . ucfirst($provider) . '.');
        }

        $providerId = (string) $socialUser->getId();
        $email = $socialUser->getEmail();

        $user = User::query()
            ->where('social_provider', $provider)
            ->where('social_provider_id', $providerId)
            ->first();

        if (!$user && $email) {
            $user = User::query()->where('email', $email)->first();
        }

        if (!$user) {
            $name = trim((string) ($socialUser->getName() ?: $socialUser->getNickname() ?: 'Patient'));
            $fallbackEmail = $email ?: ('apple-user-' . Str::lower(Str::random(10)) . '@no-email.local');

            $user = User::create([
                'name' => $name,
                'email' => $fallbackEmail,
                'password' => Hash::make(Str::random(32)),
                'social_provider' => $provider,
                'social_provider_id' => $providerId,
                'email_verified_at' => now(),
            ]);
        } else {
            $updates = [];

            if (empty($user->social_provider)) {
                $updates['social_provider'] = $provider;
            }

            if (empty($user->social_provider_id)) {
                $updates['social_provider_id'] = $providerId;
            }

            if (!$user->email_verified_at && $email) {
                $updates['email_verified_at'] = now();
            }

            if (!empty($updates)) {
                $user->update($updates);
            }
        }

        $patientRole = Role::firstOrCreate(['name' => 'patient']);
        $user->roles()->syncWithoutDetaching([$patientRole->id]);

        $token = $user->createToken('patient-web')->plainTextToken;
        $frontendUrl = rtrim(config('app.frontend_url'), '/');

        return redirect()->away($frontendUrl . '/account?social_token=' . urlencode($token));
    }

    private function redirectWithError(string $message): RedirectResponse
    {
        $frontendUrl = rtrim(config('app.frontend_url'), '/');

        return redirect()->away($frontendUrl . '/account?social_error=' . urlencode($message));
    }
}
