<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\VivaWalletOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PatientOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $orders = VivaWalletOrder::query()
            ->with(['package:id,name,path,price'])
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhere('email', $user->email);
            })
            ->latest('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'orders' => $orders->map(fn(VivaWalletOrder $order) => $this->transformOrder($order))->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.package_id' => ['required', 'integer', 'exists:packages,id'],
            'items.*.quantity' => ['nullable', 'integer', 'min:1', 'max:10'],
            'email' => ['required', 'email', 'max:255'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:50'],
            'country' => ['nullable', 'string', 'max:100'],
            'sampling_centre' => ['required', 'string', 'max:255'],
            'appointment_date' => ['required', 'date'],
            'appointment_time' => ['required', 'date_format:H:i'],
        ]);

        $packageIds = collect($validated['items'])->pluck('package_id')->values();
        $packagesById = Package::query()
            ->whereIn('id', $packageIds)
            ->get(['id', 'price'])
            ->keyBy('id');

        $orders = DB::transaction(function () use ($validated, $packagesById, $user) {
            $created = collect();

            foreach ($validated['items'] as $item) {
                $package = $packagesById->get($item['package_id']);
                $quantity = max(1, (int) ($item['quantity'] ?? 1));
                $price = (float) (optional($package)->price ?? 0);
                $amount = $price * $quantity;

                $created->push(VivaWalletOrder::create([
                    'package_id' => $item['package_id'],
                    'user_id' => $user->id,
                    'email' => $validated['email'],
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'phone' => $validated['phone'],
                    'country' => $validated['country'] ?? 'Cyprus',
                    'appointment_date' => $validated['appointment_date'],
                    'appointment_time' => $validated['appointment_time'],
                    'sampling_centre' => $validated['sampling_centre'],
                    'quantity' => $quantity,
                    'amount' => $amount,
                    'currency' => 'EUR',
                    'viva_wallet_order_ref' => 'LAB-' . now()->format('YmdHis') . '-' . strtoupper(Str::random(8)),
                    'payment_status' => 'pending',
                    'result_status' => 'pending',
                ]));
            }

            return $created;
        });

        return response()->json([
            'success' => true,
            'message' => 'Order created successfully.',
            'orders' => $orders->map(fn(VivaWalletOrder $order) => $this->transformOrder($order->loadMissing('package:id,name,path,price')))->values(),
        ], 201);
    }

    public function ingestResult(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_ref' => ['required', 'string', 'exists:viva_wallet_orders,viva_wallet_order_ref'],
            'result_status' => ['required', 'string', 'max:50'],
            'result_reference' => ['nullable', 'string', 'max:255'],
            'result_payload' => ['nullable', 'array'],
        ]);

        $order = VivaWalletOrder::query()
            ->where('viva_wallet_order_ref', $validated['order_ref'])
            ->firstOrFail();

        $order->update([
            'result_status' => $validated['result_status'],
            'result_reference' => $validated['result_reference'] ?? $order->result_reference,
            'result_payload' => $validated['result_payload'] ?? $order->result_payload,
            'result_received_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Result received successfully.',
            'order' => $this->transformOrder($order->loadMissing('package:id,name,path,price')),
        ]);
    }

    private function transformOrder(VivaWalletOrder $order): array
    {
        return [
            'id' => $order->id,
            'order_ref' => $order->viva_wallet_order_ref,
            'payment_status' => $order->payment_status,
            'amount' => (float) $order->amount,
            'currency' => $order->currency,
            'quantity' => (int) $order->quantity,
            'sampling_centre' => $order->sampling_centre,
            'appointment_date' => optional($order->appointment_date)->format('Y-m-d'),
            'appointment_time' => $order->appointment_time,
            'created_at' => optional($order->created_at)->toISOString(),
            'package' => $order->package ? [
                'id' => $order->package->id,
                'name' => $order->package->name,
                'path' => $order->package->path,
                'price' => $order->package->price,
            ] : null,
            'result' => [
                'status' => $order->result_status,
                'reference' => $order->result_reference,
                'received_at' => optional($order->result_received_at)->toISOString(),
                'payload' => $order->result_payload,
            ],
        ];
    }
}
