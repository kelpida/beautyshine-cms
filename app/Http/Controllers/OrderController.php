<?php

namespace App\Http\Controllers;

use App\Enum\OrderSourceEnum;
use App\Enum\PaymentMethodEnum;
use App\Http\Requests\Order\PublicStoreOrderRequest;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateOrderRequest;
use App\Models\Order;

use App\Http\Resources\Order\OrderResource;
use App\Http\Resources\Package\PackageResource;
use App\Models\Client;
use App\Models\OrderAppointment;
use App\Models\Package;
use App\Models\Store;
use App\Services\CalculateAmountService;
use App\Services\PaymentProviderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class OrderController extends Controller
{
    protected $vivaWallet;
    protected $calculateAmount;

    public function __construct(
        PaymentProviderService $vivaWallet,
        CalculateAmountService $calculateAmount
    ) {
        $this->vivaWallet = $vivaWallet;
        $this->calculateAmount = $calculateAmount;
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Order::query()->with(['client', 'transactions', 'items']);

        // 🔍 Filter by order ID
        if ($request->filled('order_id')) {
            $query->where('id', $request->order_id);
        }

        // 🔍 Filter by client email
        if ($request->filled('email')) {
            $query->whereHas('client', function ($q) use ($request) {
                $q->where('email', 'like', '%' . $request->email . '%');
            });
        }

        // 🔍 Filter by order status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // 🔥 Payment status (FIXED)
        $query->when(
            $request->filled('payment_status'),
            fn($q) =>
            $q->whereHas(
                'latestTransaction',
                fn($q2) =>
                $q2->where('status', $request->payment_status)
            )
        );

        // 🔥 Transaction ID (FIXED)
        $query->when(
            $request->filled('transaction_id'),
            fn($q) =>
            $q->whereHas(
                'latestTransaction',
                fn($q2) =>
                $q2->where('transaction_id', 'like', '%' . $request->transaction_id . '%')
            )
        );

        $orders = $query->latest()->paginate(15);

        return Inertia::render('Orders/OrdersIndexPage', [
            'orders' => OrderResource::collection($orders),
            'filters' => $request->only([
                'order_id',
                'email',
                'status',
                'payment_status',
                'transaction_id',
            ])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $packages = Package::whereNull('deleted_at')->where('package_status_id', 1)->get();
        $clients = Client::all();
        $stores = Store::whereNull("deleted_at")->get();

        return Inertia::render('Orders/OrderFormPage', [
            'packages' => PackageResource::collection($packages),
            'clients' => $clients,
            'stores' => $stores
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOrderRequest $request)
    {
        $validatedData = $request->validated();

        return DB::transaction(function () use ($validatedData) {
            [$itemsAmount, $discountPrice, $totalAmount] =
                $this->calculateAmount->calculate(
                    $validatedData['items'],
                    $validatedData['promo_code_id'] ?? null
                );

            if (empty($validatedData['client_id'])) {
                $client = Client::create($validatedData['client']);
            }

            $order = Order::create([
                'client_id' => $validatedData['client_id'] ?? $client->id,
                'promo_code_id' => $validatedData['promo_code_id'] ?? null,
                'amount' => $itemsAmount,
                'discount_amount' => $discountPrice ?? 0,
                'source' => $validatedData['source'] ?? null,
                'payment_method' => $validatedData['payment_method'] ?? null,
                'total_amount' => $totalAmount,
                'status' => Order::STATUS_PENDING,
            ]);

            // ✅ optimize packages
            $packages = Package::whereIn(
                'id',
                collect($validatedData['items'])->pluck('item_id')
            )->get()->keyBy('id');

            foreach ($validatedData['items'] as $item) {
                $package = $packages[$item['item_id']] ?? null;
                if (!$package)
                    continue;

                $totalItemPrice = $package->price * $item['quantity'];

                $order->items()->create([
                    'package_id' => $package->id,
                    'package_name' => $package->name,
                    'price' => $package->price,
                    'quantity' => $item['quantity'],
                    'total_price' => $totalItemPrice,
                ]);
            }

            $appointment = $validatedData['appointments'];

            $order->appointments()->create([
                'store_id' => $appointment['store_id'],
                'date' => $appointment['date'],
                'start_time' => $appointment['start_time'],
                'end_time' => $appointment['end_time'],
                'status' => OrderAppointment::STATUS_PENDING,
                'duration' => $appointment['duration'],
            ]);

            // Send client order confirmation email only (admin email will be sent after payment)
            try {
                $client = $order->client;
                Mail::to($client->email)->send(new \App\Mail\ClientOrderMail($order, $client));
            } catch (\Exception $e) {
                Log::error('Order email notification failed: ' . $e->getMessage());
            }

            return Inertia::render('Orders/OrdersShowPage', [
                'order' => new OrderResource($order),
            ]);
        });
    }
    /**
     * Store a newly created resource in storage.
     */
    public function publicStore(PublicStoreOrderRequest $request)
    {
        $validatedData = $request->validated();

        return DB::transaction(function () use ($validatedData) {
            [$itemsAmount, $discountPrice, $totalAmount] =
                $this->calculateAmount->calculate(
                    $validatedData['items'],
                    $validatedData['promo_code_id'] ?? null
                );

            $vivaData = $this->vivaWallet->createOrder(
                $totalAmount,
                $validatedData['client_id']
            );

            $order = Order::create([
                'client_id' => $validatedData['client_id'],
                'promo_code_id' => $validatedData['promo_code_id'] ?? null,
                'amount' => $itemsAmount,
                'discount_amount' => $discountPrice ?? 0,
                'source' =>  OrderSourceEnum::STORE,
                'payment_method' => PaymentMethodEnum::CARD,
                'total_amount' => $totalAmount,
                'status' => Order::STATUS_PENDING,
            ]);

            // ✅ optimize packages
            $packages = Package::whereIn(
                'id',
                collect($validatedData['items'])->pluck('item_id')
            )->get()->keyBy('id');

            foreach ($validatedData['items'] as $item) {
                $package = $packages[$item['item_id']] ?? null;
                if (!$package)
                    continue;

                $totalItemPrice = $package->price * $item['quantity'];

                $order->items()->create([
                    'package_id' => $package->id,
                    'package_name' => $package->name,
                    'price' => $package->price,
                    'quantity' => $item['quantity'],
                    'total_price' => $totalItemPrice,
                ]);
            }

            $order->transactions()->create([
                'order_code' => $vivaData['orderCode'],
                'status' => 'pending',
            ]);

            $appointment = $validatedData['appointments'];

            $order->appointments()->create([
                'store_id' => $appointment['store_id'],
                'date' => $appointment['date'],
                'start_time' => $appointment['start_time'],
                'end_time' => $appointment['end_time'],
                'status' => OrderAppointment::STATUS_PENDING,
                'duration' => $appointment['duration'],
            ]);

            // Send client order confirmation email only (admin email will be sent after payment)
            try {
                $client = $order->client;
                Mail::to($client->email)->send(new \App\Mail\ClientOrderMail($order, $client));
            } catch (\Exception $e) {
                Log::error('Order email notification failed: ' . $e->getMessage());
            }

            return response()->json([
                'order_id' => $order->id,
                'checkout_url' => $vivaData['checkoutUrl'],
            ]);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        $order->load(['client', 'transactions', 'items', 'promoCode', 'appointments']);

        if (!$order->is_seen) {
            $order->update([
                'is_seen' => true,
                'seen_at' => now(),
            ]);
        }

        return Inertia::render('Orders/OrdersShowPage', [
            'order' => new OrderResource($order),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Order $order)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOrderRequest $request, Order $order)
    {
        $validatedData = $request->validated();
        $order->update($validatedData);

        $order->appointments->update(["status" => $validatedData['status'] !== "processing" ? $validatedData['status'] : "confirmed"]);

        return redirect()->back()->with('success', 'Order updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        //
    }
}
