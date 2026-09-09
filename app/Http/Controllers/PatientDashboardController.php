<?php

namespace App\Http\Controllers;

use App\Models\VivaWalletOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientDashboardController extends Controller
{
    public function __invoke(Request $request): Response
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

        return Inertia::render('Patient/Dashboard', [
            'patient' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'orders' => $orders->map(function (VivaWalletOrder $order) {
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
                        'name' => $order->package->name,
                        'path' => $order->package->path,
                    ] : null,
                    'result' => [
                        'status' => $order->result_status,
                        'reference' => $order->result_reference,
                        'received_at' => optional($order->result_received_at)->toISOString(),
                    ],
                ];
            }),
        ]);
    }
}
