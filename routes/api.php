<?php

use App\Http\Controllers\AttributeCategoryController;
use App\Http\Controllers\AttributeController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\IntegrationController;
use App\Http\Controllers\PromoCodeController;
use App\Http\Controllers\TransalteGoogleController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PatientAuthController;
use App\Http\Controllers\PatientOrderController;
use App\Http\Controllers\PatientSocialAuthController;
use App\Http\Controllers\VisitorSessionController;
use App\Http\Controllers\SubscriptionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\PackageStatusController;
use App\Http\Controllers\PackageCategoryController;
use App\Http\Controllers\PackageGenderController;
use App\Http\Controllers\PackageAgeController;
use App\Http\Controllers\PackageLogController;
use App\Http\Controllers\VivaWebhookController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\StoreController;

Route::prefix('public/auth')->middleware(['throttle:30,1'])->group(function () {
    Route::post('/register', [ClientController::class, 'register']);
    Route::post('/login', [ClientController::class, 'login']);
    Route::get('/social/{provider}/redirect', [PatientSocialAuthController::class, 'redirect']);
    Route::match(['get', 'post'], '/social/{provider}/callback', [PatientSocialAuthController::class, 'callback']);
    Route::post('/forgot-password', [ClientController::class, 'forgotPassword']);
    Route::get('/verify-account', [ClientController::class, 'verifyAccount']);
    Route::post('/resend-verification', [ClientController::class, 'resendVerificationApi']);
    Route::post('/reset-password', [ClientController::class, 'resetPassword']);
    // Route::get('/verify-email/{id}/{hash}', [ClientController::class, 'verifyEmail'])
    //     ->middleware(['signed', 'throttle:6,1'])
    //     ->name('patient.verification.verify');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [ClientController::class, 'publicShow']);
        Route::post('/logout', [ClientController::class, 'logout']);
        Route::post('/change-password', [ClientController::class, 'changePassword']);
        // Route::get('/orders', [PatientOrderController::class, 'index']);
        Route::post('/orders', [OrderController::class, 'store']);
        Route::get('/check-promo/{code}', [PromoCodeController::class, 'checkPromo']);
        Route::get('/appointments/slots', [AppointmentController::class, 'getAvailableSlots']);
    });
});

Route::middleware(['api.bearer'])->group(function () {
    Route::group(['prefix' => 'public'], function () {
        Route::get('/pages', [PageController::class, 'publicIndex']);
        Route::get('/integrations', [IntegrationController::class, 'publicIndex']);
        Route::get('/stores', [StoreController::class, 'publicIndex']);
        Route::get('/visitor-session', [VisitorSessionController::class, 'store']);
        Route::post('/package-log', [PackageLogController::class, 'store']);

        Route::prefix('/packages')->group(function () {
            Route::get('/', [PackageController::class, 'publicIndex']);
            Route::get('/categories', [PackageCategoryController::class, 'publicIndex']);
            Route::get('/genders', [PackageGenderController::class, 'publicIndex']);
            Route::get('/ages', [PackageAgeController::class, 'publicIndex']);
            Route::get('/statuses', [PackageStatusController::class, 'publicIndex']);
            Route::get('/attributes', [AttributeController::class, 'publicIndex']);
            Route::get('/attributes-categories', [AttributeCategoryController::class, 'publicIndex']);

            //must be end of the packages group
            Route::get('{package}', [PackageController::class, 'publicShow']);
        });

        // Contact form routes
        Route::post('/contact', [ContactController::class, 'sendContactForm']);
        Route::post('/subscribe', [ContactController::class, 'subscribe']);
        Route::post('/interested', [ContactController::class, 'sendInterestedForm']);
        Route::post('/order', [OrderController::class, 'store']);

        // Subscription route
        Route::post('/subscriptions', [SubscriptionController::class, 'store']);
        Route::post('/results/ingest', [PatientOrderController::class, 'ingestResult']);
        Route::post('/auth/guest-provision', [PatientAuthController::class, 'guestProvision']);
    });
});

Route::match(['get', 'post'], '/viva/webhook', [VivaWebhookController::class, 'handle']);
