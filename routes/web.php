<?php

use App\Http\Controllers\AppointmentController;

use App\Http\Controllers\AttributeController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\BlockContentController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\EshopCategoryController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PaymentProviderController;
use App\Http\Controllers\PostCategoryController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;

use App\Http\Controllers\PatientDashboardController;
use App\Http\Controllers\PromoCodeController;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TransalteGoogleController;
use App\Http\Controllers\UploadFilesController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
});

Route::middleware(['web', 'auth', HandleInertiaRequests::class])->group(function () {

    // ✅ NO permission check
    Route::get('/dashboard', function (\Illuminate\Http\Request $request) {
        return Inertia::render('Dashboard/DashboardPage', [
            'visitsChart' => [],
            'wishlistChart' => [],
            'shareChart' => [],
            'filters' => [
                'from' => $request->from ?? now()->subDays(30)->toDateString(),
                'to' => $request->to ?? now()->toDateString(),
            ],
        ]);
    })->name('dashboard');
    Route::get('/patient-dashboard', PatientDashboardController::class)->name('patient.dashboard');

    Route::get('/products/order-items', [ProductController::class, 'orderItems'])->name('products.order-items');

    Route::resource('/order-calendar', AppointmentController::class);
    Route::post('/order-calendar/available-slots', [AppointmentController::class, 'getWorkingHours'])
        ->name('order-calendar.available-slots');
    Route::post('/appointments/available-slots', [AppointmentController::class, 'getWorkingHours'])
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
        Route::resource('eshop-categories', EshopCategoryController::class);
        Route::resource('eshop-tags', TagController::class);
        Route::resource('eshop-attributes', AttributeController::class);
        Route::resource('eshop-products', ProductController::class);
        Route::resource('uploads', UploadFilesController::class);

        Route::resource('orders', OrderController::class);

        Route::resource('stores', StoreController::class);
        Route::match(['get', 'post'], 'stores/{store}/working-hours', [StoreController::class, 'workingHours'])->name('stores.working-hours');
        Route::resource('holidays', HolidayController::class);

        Route::resource('roles', RolesController::class);
        Route::resource('users', UserController::class);
        Route::get('patients', [UserController::class, 'patients'])->name('patients.index');

        Route::resource('subscriptions', SubscriptionController::class);
        Route::get('/subscriptions/export', [SubscriptionController::class, 'export'])
            ->name('subscriptions.export');

        Route::resource('languages', LanguageController::class);
        Route::resource('payment-providers', PaymentProviderController::class);
        Route::resource('pages', PageController::class);
        Route::resource('block-contents', BlockContentController::class);

        Route::resource("promo-codes", PromoCodeController::class);

        Route::resource('emails', EmailController::class);

        Route::resource('clients', ClientController::class);
        Route::post('clients/{client}/resend-verification', [ClientController::class, 'resendVerificationWeb'])->name('clients.verification');
    });
});

Route::post('/logout', LogoutController::class)->name('logout');


require __DIR__ . '/auth.php';
