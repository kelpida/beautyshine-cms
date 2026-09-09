<?php

namespace App\Http\Controllers;

use App\Models\VivaWalletOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderManagementController extends Controller
{
    private const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
    private const RESULT_STATUSES = ['pending', 'processing', 'ready', 'failed'];

    public function index(Request $request): Response
    {
        $query = VivaWalletOrder::query()
            ->with([
                'package:id,name,path',
                'user:id,name,email',
            ])
            ->latest('created_at');

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));
            $query->where(function ($builder) use ($search) {
                $builder->where('viva_wallet_order_ref', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->input('payment_status'));
        }

        if ($request->filled('result_status')) {
            $query->where('result_status', $request->input('result_status'));
        }

        $orders = $query->paginate(20)
            ->withQueryString()
            ->through(function (VivaWalletOrder $order) {
                return [
                    'id' => $order->id,
                    'order_ref' => $order->viva_wallet_order_ref,
                    'patient_name' => trim($order->first_name . ' ' . $order->last_name),
                    'patient_email' => $order->email,
                    'package_name' => optional($order->package)->name,
                    'amount' => (float) $order->amount,
                    'currency' => $order->currency,
                    'quantity' => (int) ($order->quantity ?? 1),
                    'payment_status' => $order->payment_status,
                    'result_status' => $order->result_status,
                    'result_reference' => $order->result_reference,
                    'appointment_date' => optional($order->appointment_date)->format('Y-m-d'),
                    'appointment_time' => $order->appointment_time,
                    'created_at' => optional($order->created_at)->toDateTimeString(),
                ];
            });

        return Inertia::render('Orders/OrdersIndexPage', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'payment_status', 'result_status']),
            'paymentStatusOptions' => self::PAYMENT_STATUSES,
            'resultStatusOptions' => self::RESULT_STATUSES,
        ]);
    }

    public function update(Request $request, VivaWalletOrder $order): RedirectResponse
    {
        $validated = $request->validate([
            'payment_status' => ['nullable', 'in:' . implode(',', self::PAYMENT_STATUSES)],
            'result_status' => ['nullable', 'in:' . implode(',', self::RESULT_STATUSES)],
            'result_reference' => ['nullable', 'string', 'max:255'],
        ]);

        $updates = [];

        if (!empty($validated['payment_status'])) {
            $updates['payment_status'] = $validated['payment_status'];
            if ($validated['payment_status'] === 'completed' && !$order->payment_date) {
                $updates['payment_date'] = now();
            }
        }

        if (!empty($validated['result_status'])) {
            $updates['result_status'] = $validated['result_status'];
            if ($validated['result_status'] === 'ready') {
                $updates['result_received_at'] = now();
            }
        }

        if (array_key_exists('result_reference', $validated)) {
            $updates['result_reference'] = $validated['result_reference'];
        }

        if (!empty($updates)) {
            $order->update($updates);
        }

        return back()->with('success', 'Order updated successfully.');
    }
}
