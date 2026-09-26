<?php

namespace App\Http\Controllers;

use App\Enum\OrderSourceEnum;
use App\Enum\PaymentMethodEnum;
use App\Http\Requests\Order\PublicStoreOrderRequest;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateOrderRequest;
use App\Http\Resources\Order\OrderResource;
use App\Mail\ClientOrderMail;
use App\Models\Client;
use App\Models\Eshop\Product;
use App\Models\Eshop\ProductVariation;
use App\Models\Order;
use App\Models\OrderAppointment;
use App\Models\PromoCode;
use App\Models\Store;
use App\Services\CalculateAmountService;
use App\Services\PaymentProviderService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
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
        $query = Order::query()->with([
            'client',
            'transactions',
            'items.options',
            'items.customFields',
            'pickupDetails',
            'deliveryDetails',
            'appointments'
        ]);

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

        // 🔍 Filter by order type
        if ($request->filled('order_type')) {
            $query->where('order_type', $request->order_type);
        }

        // 🔥 Payment status
        $query->when(
            $request->filled('payment_status'),
            fn($q) =>
                $q->whereHas(
                    'latestTransaction',
                    fn($q2) =>
                        $q2->where('status', $request->payment_status)
                )
        );

        // 🔥 Transaction ID
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
                'order_type',
            ])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $products = Product::whereNull('deleted_at')
            ->where('is_active', true)
            ->with(['variations', 'addons', 'customFields', 'productAttributes'])

            ->when($request->filled('search'), function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            })

            ->paginate($request->get('per_page', 10));
        $clients = Client::all();
        $stores = Store::whereNull('deleted_at')->get();

        return Inertia::render('Orders/OrderFormPage', [
            'products' => $products,
            'clients' => $clients,
            'stores' => $stores,
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

            $client = null;
            if (empty($validatedData['client_id'])) {
                try {
                    $client = Client::create($validatedData['client']);
                } catch (\Throwable $th) {
                    throw $th;
                }
            }


            $order = Order::create([
                'client_id' => $validatedData['client_id'] ?? $client->id,
                'promo_code_id' => $validatedData['promo_code_id'] ?? null,
                'amount' => $itemsAmount,
                'discount_amount' => $discountPrice ?? 0,
                'source' => $validatedData['source'] ?? OrderSourceEnum::STORE->value,
                'order_type' => $validatedData['order_type'] ?? 'pickup',
                'payment_method' => $validatedData['payment_method'] ?? PaymentMethodEnum::CASH->value,
                'total_amount' => $totalAmount,
                'status' => Order::STATUS_PENDING,
            ]);

            $this->createOrderItems($order, $validatedData['items']);
            $this->createFulfillmentDetails($order, $validatedData);

            // Send client confirmation email if email exists
            try {
                $client = $order->client;
                if ($client && $client->email) {
                    Mail::to($client->email)->send(new \App\Mail\ClientOrderMail($order, $client));
                }
            } catch (\Exception $e) {
                Log::error('Order email notification failed: ' . $e->getMessage());
            }

            return Inertia::render('Orders/OrdersShowPage', [
                'order' => new OrderResource($order),
            ]);
        });
    }

    /**
     * Store a newly created resource publicly in storage.
     */
    public function publicStore(PublicStoreOrderRequest $request)
    {
        $validatedData = $request->validated();

        return DB::transaction(function () use ($validatedData) {
            // Resolve promo code (accepts both promo_code_id and promo_code string)
            $promoCodeId = $validatedData['promo_code_id'] ?? null;
            if (!$promoCodeId && !empty($validatedData['promo_code'])) {
                $promoCodeId = PromoCode::where('code', $validatedData['promo_code'])
                    ->where('is_active', true)
                    ->value('id');
            }

            [$itemsAmount, $discountPrice, $totalAmount] =
                $this->calculateAmount->calculate(
                    $validatedData['items'],
                    $promoCodeId
                );

            // Add delivery price to total if delivery is selected
            $deliveryPrice = !empty($validatedData['delivery_details']['delivery_price'])
                ? (float) $validatedData['delivery_details']['delivery_price']
                : 0;
            $finalTotalAmount = $totalAmount + $deliveryPrice;

            // Resolve or create client
            $clientId = $validatedData['client_id'] ?? (auth('sanctum')->check() ? auth('sanctum')->id() : null);

            if (!$clientId && !empty($validatedData['client'])) {
                $clientData = $validatedData['client'];
                $clientAttributes = array_filter([
                    'name' => $clientData['name'] ?? '',
                    'surname' => $clientData['surname'] ?? '',
                    'phone' => $clientData['phone'] ?? null,
                    'phone_code' => $clientData['phone_code'] ?? null,
                    'address' => $clientData['address'] ?? null,
                ]);

                if (!empty($clientData['email'])) {
                    $client = Client::firstOrCreate(
                        ['email' => $clientData['email']],
                        $clientAttributes
                    );

                    // Update existing client with any newly provided details
                    $existingUpdates = array_filter([
                        'name' => empty($client->name) ? ($clientData['name'] ?? null) : null,
                        'surname' => empty($client->surname) ? ($clientData['surname'] ?? null) : null,
                        'phone' => empty($client->phone) ? ($clientData['phone'] ?? null) : null,
                        'phone_code' => empty($client->phone_code) ? ($clientData['phone_code'] ?? null) : null,
                        'address' => empty($client->address) ? ($clientData['address'] ?? null) : null,
                    ]);
                    if (!empty($existingUpdates)) {
                        $client->update($existingUpdates);
                    }
                    $clientId = $client->id;
                } else {
                    $client = Client::create(array_merge([
                        'email' => null,
                    ], $clientAttributes));
                    $clientId = $client->id;
                }
            }

            $order = Order::create([
                'client_id' => $clientId,
                'promo_code_id' => $promoCodeId,
                'amount' => $itemsAmount,
                'discount_amount' => $discountPrice ?? 0,
                'source' => $validatedData['source'] ?? OrderSourceEnum::ONLINE->value,
                'order_type' => $validatedData['order_type'] ?? 'pickup',
                'payment_method' => $validatedData['payment_method'] ?? PaymentMethodEnum::CARD->value,
                'total_amount' => $finalTotalAmount,
                'status' => Order::STATUS_PENDING,
            ]);

            $this->createOrderItems($order, $validatedData['items']);
            $this->createFulfillmentDetails($order, $validatedData);

            // Handle payment gateway or transaction
            $checkoutUrl = null;
            $paymentMethod = $validatedData['payment_method'] ?? PaymentMethodEnum::CARD->value;
            $paymentMethodValue = $paymentMethod instanceof PaymentMethodEnum ? $paymentMethod->value : (string) $paymentMethod;

            $isCardOrWallet = in_array($paymentMethodValue, [
                PaymentMethodEnum::CARD->value,
                PaymentMethodEnum::APPLE_PAY->value,
                PaymentMethodEnum::GOOGLE_PAY->value,
                'card',
                'apple_pay',
                'google_pay',
            ], true);

            if ($isCardOrWallet) {
                try {
                    $vivaData = $this->vivaWallet->createOrder(
                        $finalTotalAmount,
                        $clientId
                    );

                    $orderCode = $vivaData['orderCode'] ?? null;
                    $checkoutUrl = $vivaData['checkoutUrl'] ?? null;

                    $order->transactions()->create([
                        'order_code' => $orderCode,
                        'status' => 'pending',
                    ]);
                } catch (\Exception $e) {
                    Log::error('Viva Wallet order creation failed: ' . $e->getMessage());

                    // Fallback transaction so order always has a transaction record
                    $order->transactions()->create([
                        'order_code' => 'ORD-' . strtoupper(uniqid()),
                        'status' => 'pending',
                    ]);
                }
            } else {
                $order->transactions()->create([
                    'order_code' => 'ORD-' . strtoupper(uniqid()),
                    'status' => 'pending',
                ]);
            }

            // Send client confirmation email
            try {
                $client = $order->client;
                if ($client && $client->email) {
                    Mail::to($client->email)->send(new ClientOrderMail($order, $client));
                }
            } catch (\Exception $e) {
                Log::error('Order email notification failed: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'order_id' => $order->id,
                'checkout_url' => $checkoutUrl,
            ], 201);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        $order->load([
            'client',
            'transactions',
            'items.options',
            'items.customFields',
            'promoCode',
            'appointments.store',
            'pickupDetails.store',
            'deliveryDetails',
        ]);

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

        if ($order->appointments) {
            $order->appointments->update([
                'status' => $validatedData['status'] !== 'processing' ? $validatedData['status'] : 'confirmed'
            ]);
        }

        return redirect()->back()->with('success', 'Order updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        //
    }

    /**
     * Helper to create items, options, and custom fields for an order.
     */
    protected function createOrderItems(Order $order, array $items): void
    {
        $productIds = collect($items)
            ->map(fn($item) => $item['product_id'] ?? $item['item_id'] ?? null)
            ->filter()
            ->unique();

        $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

        $variationIds = collect($items)
            ->pluck('variation_id')
            ->filter()
            ->unique();

        $variations = $variationIds->isNotEmpty()
            ? ProductVariation::whereIn('id', $variationIds)->get()->keyBy('id')
            : collect();

        foreach ($items as $item) {
            $productId = $item['product_id'] ?? $item['item_id'] ?? null;
            $product = $products[$productId] ?? null;
            if (!$product) {
                continue;
            }

            $variation = !empty($item['variation_id'])
                ? ($variations[$item['variation_id']] ?? null)
                : null;

            $unitPrice = isset($item['price']) && is_numeric($item['price'])
                ? (float) $item['price']
                : (float) ($variation?->sale_price ?? $variation?->price ?? $product->sale_price ?? $product->base_price ?? 0);

            // Add option price modifiers
            if (!empty($item['options']) && is_array($item['options'])) {
                foreach ($item['options'] as $opt) {
                    if (isset($opt['price_modifier']) && is_numeric($opt['price_modifier'])) {
                        $unitPrice += (float) $opt['price_modifier'];
                    }
                }
            }

            $quantity = (int) ($item['quantity'] ?? 1);
            $totalItemPrice = $unitPrice * $quantity;

            $orderItem = $order->items()->create([
                'product_id' => $product->id,
                'variation_id' => $variation?->id,
                'product_name' => $product->name,
                'variation_name' => $variation?->name,
                'price' => $unitPrice,
                'quantity' => $quantity,
                'total_price' => $totalItemPrice,
            ]);

            // Create item options
            if (!empty($item['options']) && is_array($item['options'])) {
                foreach ($item['options'] as $opt) {
                    $orderItem->options()->create([
                        'attribute_name' => $opt['attribute_name'] ?? '',
                        'option_name' => $opt['option_name'] ?? '',
                        'price_modifier' => $opt['price_modifier'] ?? 0,
                    ]);
                }
            }

            // Create item custom fields
            if (!empty($item['custom_fields']) && is_array($item['custom_fields'])) {
                foreach ($item['custom_fields'] as $cf) {
                    $orderItem->customFields()->create([
                        'field_name' => $cf['field_name'] ?? '',
                        'value' => is_scalar($cf['value']) ? (string) $cf['value'] : json_encode($cf['value']),
                    ]);
                }
            }
        }
    }

    /**
     * Helper to create pickup, delivery, or legacy appointment records.
     */
    protected function createFulfillmentDetails(Order $order, array $validatedData): void
    {
        // Pickup details
        if (!empty($validatedData['pickup_details'])) {
            $pickup = $validatedData['pickup_details'];
            $order->pickupDetails()->create([
                'store_id' => $pickup['store_id'] ?? null,
                'pickup_date' => $pickup['pickup_date'] ?? null,
                'pickup_time' => $pickup['pickup_time'] ?? null,
                'note' => $pickup['note'] ?? null,
            ]);
        }

        // Delivery details
        if (!empty($validatedData['delivery_details'])) {
            $delivery = $validatedData['delivery_details'];
            $order->deliveryDetails()->create([
                'delivery_address' => $delivery['delivery_address'] ?? null,
                'post_code' => $delivery['post_code'] ?? null,
                'city' => $delivery['city'] ?? null,
                'country' => $delivery['country'] ?? null,
                'delivery_date' => $delivery['delivery_date'] ?? null,
                'delivery_time' => $delivery['delivery_time'] ?? null,
                'delivery_price' => $delivery['delivery_price'] ?? 0,
                'note' => $delivery['note'] ?? null,
            ]);
        }

        // Appointments (explicit or auto-created for calendar visibility)
        if (!empty($validatedData['appointments'])) {
            $appointment = $validatedData['appointments'];
            $order->appointments()->create([
                'store_id' => $appointment['store_id'] ?? null,
                'date' => $appointment['date'] ?? null,
                'start_time' => $appointment['start_time'] ?? null,
                'end_time' => $appointment['end_time'] ?? null,
                'status' => OrderAppointment::STATUS_PENDING,
                'duration' => $appointment['duration'] ?? 0,
            ]);
        } elseif (!empty($validatedData['pickup_details'])) {
            // Auto-create calendar appointment entry for pickup
            $pickup = $validatedData['pickup_details'];
            $pickupTime = $pickup['pickup_time'] ?? null;
            $endTime = $pickupTime ? Carbon::parse($pickupTime)->addMinutes(30)->format('H:i') : null;

            if (!empty($pickup['pickup_date'])) {
                $order->appointments()->create([
                    'store_id' => $pickup['store_id'] ?? null,
                    'date' => $pickup['pickup_date'],
                    'start_time' => $pickupTime,
                    'end_time' => $endTime,
                    'status' => OrderAppointment::STATUS_PENDING,
                    'duration' => 30,
                ]);
            }
        } elseif (!empty($validatedData['delivery_details'])) {
            // Auto-create calendar appointment entry for delivery
            $delivery = $validatedData['delivery_details'];
            $deliveryTime = $delivery['delivery_time'] ?? null;
            $endTime = $deliveryTime ? Carbon::parse($deliveryTime)->addMinutes(30)->format('H:i') : null;

            if (!empty($delivery['delivery_date'])) {
                $order->appointments()->create([
                    'store_id' => null,
                    'date' => $delivery['delivery_date'],
                    'start_time' => $deliveryTime,
                    'end_time' => $endTime,
                    'status' => OrderAppointment::STATUS_PENDING,
                    'duration' => 30,
                ]);
            }
        }
    }
}
