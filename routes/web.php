<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AttributeCategoryController;
use App\Http\Controllers\AttributeController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\BlockContentController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderManagementController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PostCategoryController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\PackageLogController;
use App\Http\Controllers\PackageStatusController;
use App\Http\Controllers\PackageCategoryController;
use App\Http\Controllers\PackageGenderController;
use App\Http\Controllers\PackageAgeController;
use App\Http\Controllers\PatientDashboardController;
use App\Http\Controllers\PromoCodeController;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TransalteGoogleController;
use App\Http\Controllers\UploadFilesController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
});

Route::middleware(['web', 'auth', HandleInertiaRequests::class])->group(function () {

    // ✅ NO permission check
    Route::get('/dashboard', [PackageLogController::class, 'index'])->name('dashboard');
    Route::get('/patient-dashboard', PatientDashboardController::class)->name('patient.dashboard');
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/create', [OrderController::class, 'create'])->name('orders.create');
    Route::post('/orders/create', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::patch('/orders/{order}', [OrderController::class, 'update'])->name('orders.update');

    Route::resource('/appointments', AppointmentController::class);
    Route::post('/appointments/available-slots', [AppointmentController::class, 'getAvailableSlots'])
        ->name('appointments.available-slots');


    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('/google-translate', [TransalteGoogleController::class, 'translate'])
        ->name('google-translate');

    Route::post('/users/{user}/impersonate', [UserController::class, 'impersonate'])
        ->middleware('can:impersonate-user')
        ->name('users.impersonate');

    Route::post('/leave-impersonation', [UserController::class, 'leaveImpersonation'])
        ->name('users.leave-impersonation');

    // 🔐 PERMISSION-PROTECTED CRUD
    Route::middleware(['permission'])->group(function () {

        Route::resource('posts', PostController::class);
        Route::resource('post-categories', PostCategoryController::class);
        Route::resource('uploads', UploadFilesController::class);

        Route::resource('stores', StoreController::class);
        Route::resource('holidays', HolidayController::class);

        Route::resource('roles', RolesController::class);
        Route::resource('users', UserController::class);
        Route::get('patients', [UserController::class, 'patients'])->name('patients.index');

        Route::resource('subscriptions', SubscriptionController::class);
        Route::get('/subscriptions/export', [SubscriptionController::class, 'export'])
            ->name('subscriptions.export');

        Route::resource('languages', LanguageController::class);
        Route::resource('pages', PageController::class);
        Route::resource('block-contents', BlockContentController::class);

        Route::resource("promo-codes", PromoCodeController::class);

        // Packages prefix routes must come BEFORE resource to avoid matching conflicts
        Route::prefix('packages')->group(function () {
            Route::resource('attributes', AttributeController::class);
            Route::resource('attribute-categories', AttributeCategoryController::class);
            Route::resource('statuses', PackageStatusController::class)->names([
                'index' => 'package-statuses.index',
                'create' => 'package-statuses.create',
                'store' => 'package-statuses.store',
                'show' => 'package-statuses.show',
                'edit' => 'package-statuses.edit',
                'update' => 'package-statuses.update',
                'destroy' => 'package-statuses.destroy',
            ]);
            Route::resource('categories', PackageCategoryController::class)->names([
                'index' => 'package-categories.index',
                'create' => 'package-categories.create',
                'store' => 'package-categories.store',
                'show' => 'package-categories.show',
                'edit' => 'package-categories.edit',
                'update' => 'package-categories.update',
                'destroy' => 'package-categories.destroy',
            ]);
            Route::resource('genders', PackageGenderController::class)->names([
                'index' => 'package-genders.index',
                'create' => 'package-genders.create',
                'store' => 'package-genders.store',
                'show' => 'package-genders.show',
                'edit' => 'package-genders.edit',
                'update' => 'package-genders.update',
                'destroy' => 'package-genders.destroy',
            ]);
            Route::resource('ages', PackageAgeController::class)->names([
                'index' => 'package-ages.index',
                'create' => 'package-ages.create',
                'store' => 'package-ages.store',
                'show' => 'package-ages.show',
                'edit' => 'package-ages.edit',
                'update' => 'package-ages.update',
                'destroy' => 'package-ages.destroy',
            ]);
            Route::post('/import', [PackageController::class, 'import'])->name('packages.import');
            Route::post('/{package}/duplicate', [PackageController::class, 'duplicate'])->name('packages.duplicate');
        });

        // Packages resource comes AFTER prefix group
        Route::resource('packages', PackageController::class);

        Route::resource('emails', EmailController::class);

        Route::resource('clients', ClientController::class);
        Route::post('clients/{client}/resend-verification', [ClientController::class, 'resendVerificationWeb'])->name('clients.verification');
    });
});

Route::post('/logout', LogoutController::class)->name('logout');


require __DIR__ . '/auth.php';
