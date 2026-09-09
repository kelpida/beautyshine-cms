<?php

namespace App\Providers;

use App\Models\BlockContent;
use App\Observers\AuditableObserver;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Gate;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(3);
        BlockContent::observe(AuditableObserver::class);

        Gate::define('impersonate-user', function ($user) {
            return $user->hasRole('super-admin');
        });

        ResetPassword::createUrlUsing(function (object $user, string $token) {
            $frontendUrl = config('app.frontend_url');
            $email = urlencode($user->email);

            return rtrim($frontendUrl, '/') . '/account/reset-password?token=' . $token . '&email=' . $email;
        });
    }
}
