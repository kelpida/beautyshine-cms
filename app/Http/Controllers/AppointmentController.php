<?php

namespace App\Http\Controllers;

use App\Enum\DayOfWeek;
use App\Models\Holiday;
use App\Models\Order;
use App\Models\OrderAppointment;
use App\Models\Package;
use App\Models\PickupDetails;
use App\Models\Store;
use App\Models\StoreHour;
use App\Models\StorePackageCapacity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    /**
     * Backward-compatibility alias delegating to StoreController::workingHours
     */
    public function getWorkingHours(Request $request): JsonResponse
    {
        return app(StoreController::class)->workingHours($request);
    }

    /**
     * Backward-compatibility alias delegating to StoreController::workingHours
     */
    public function getAvailableSlots(Request $request): JsonResponse
    {
        return app(StoreController::class)->workingHours($request);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Appointments/IndexAppointmentsPage', [
            'pickupOrders' => Order::with(['pickupDetails.store', 'client'])
                ->whereHas('pickupDetails', fn($query) => $query->whereNotNull('pickup_date'))
                ->get()
                ->map(fn($order) => [
                    'id' => $order->id,
                    'order_id' => $order->id,
                    'date' => $order->pickupDetails->pickup_date,
                    'start_time' => $order->pickupDetails->pickup_time,
                    'status' => $order->status,
                    'customer_name' => trim(($order->client?->name ?? '') . " " . ($order->client?->surname ?? '')),
                ]),

            'deliveryOrders' => Order::with(['deliveryDetails', 'client'])
                ->whereHas('deliveryDetails', fn($query) => $query->whereNotNull('delivery_date'))
                ->get()
                ->map(fn($order) => [
                    'id' => $order->id,
                    'order_id' => $order->id,
                    'date' => $order->deliveryDetails->delivery_date,
                    'start_time' => $order->deliveryDetails->delivery_time,
                    'status' => $order->status,
                    'customer_name' => trim(($order->client?->name ?? '') . " " . ($order->client?->surname ?? '')),
                ]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(OrderAppointment $appointment)
    {
        return Inertia::render('Appointments/Calendar', [
            'appointment' => $appointment->with(['orderItem', 'store'])
                ->map(fn($appointment) => [
                    'id' => $appointment->id,
                    'date' => $appointment->date,
                    'order_id' => $appointment->order_id,
                    'start_time' => substr($appointment->start_time, 0, 5),
                    'end_time' => substr($appointment->end_time, 0, 5),
                    'status' => $appointment->status,
                    'customer_name' => $appointment->order?->client->name . " " . $appointment->order?->client->surname,
                ]),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
