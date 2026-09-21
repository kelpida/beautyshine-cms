<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaymentProvider\StorePaymentProviderRequest;
use App\Http\Requests\PaymentProvider\UpdatePaymentProviderRequest;
use App\Http\Resources\PaymentProvider\PaymentProviderResource;
use App\Models\PaymentProvider;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentProviderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PaymentProvider::query()->with('logo');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('code')) {
            $query->where('code', $request->code);
        }

        $paymentProviders = $query->latest()->get();

        if ($request->wantsJson()) {
            return response()->json(PaymentProviderResource::collection($paymentProviders));
        }

        return Inertia::render('PaymentProvider/IndexPaymentProviderPage', [
            'paymentProviders' => PaymentProviderResource::collection($paymentProviders),
            'filters' => $request->only(['status', 'code']),
        ]);
    }

    /**
     * Display a public listing of active payment providers for checkout.
     */
    public function publicIndex()
    {
        $paymentProviders = PaymentProvider::active()
            ->with('logo')
            ->get([
                'id',
                'name',
                'code',
                'description',
                'logo_id',
                'is_production',
                'public_key',
            ]);

        return response()->json($paymentProviders);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('PaymentProvider/FormPaymentProviderPage', [
            'paymentProvider' => null,
            'images' => \App\Models\UploadFile::where('type', 'image')->latest()->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePaymentProviderRequest $request)
    {
        $paymentProvider = PaymentProvider::create($request->validated());

        if ($request->wantsJson()) {
            return response()->json(new PaymentProviderResource($paymentProvider), 201);
        }

        return redirect()
            ->route('payment-providers.index')
            ->with('success', 'Payment provider created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, PaymentProvider $paymentProvider)
    {
        $paymentProvider->load('logo');

        if ($request->wantsJson()) {
            return response()->json(new PaymentProviderResource($paymentProvider));
        }

        return Inertia::render('PaymentProvider/FormPaymentProviderPage', [
            'paymentProvider' => new PaymentProviderResource($paymentProvider),
            'images' => \App\Models\UploadFile::where('type', 'image')->latest()->get(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PaymentProvider $paymentProvider)
    {
        return Inertia::render('PaymentProvider/FormPaymentProviderPage', [
            'paymentProvider' => new PaymentProviderResource($paymentProvider->load('logo')),
            'images' => \App\Models\UploadFile::where('type', 'image')->latest()->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePaymentProviderRequest $request, PaymentProvider $paymentProvider)
    {
        $paymentProvider->update($request->validated());

        if ($request->wantsJson()) {
            return response()->json(new PaymentProviderResource($paymentProvider));
        }

        return redirect()
            ->route('payment-providers.index')
            ->with('success', 'Payment provider updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, PaymentProvider $paymentProvider)
    {
        $paymentProvider->delete();

        if ($request->wantsJson()) {
            return response()->json(null, 204);
        }

        return redirect()
            ->route('payment-providers.index')
            ->with('success', 'Payment provider deleted successfully.');
    }
}
