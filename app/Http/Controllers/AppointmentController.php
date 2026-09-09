<?php

namespace App\Http\Controllers;

use App\Enum\DayOfWeek;
use App\Models\Holiday;
use App\Models\OrderAppointment;
use App\Models\Package;
use App\Models\Store;
use App\Models\StoreHour;
use App\Models\StorePackageCapacity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    /**
     * Get available appointment slots for a given package, store, and date.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getAvailableSlots(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'store_id' => ['required', 'integer', 'exists:stores,id'],
            'packages' => ['required', 'array'],
            'packages.*.id' => ['required', 'integer', 'exists:packages,id'],
            'packages.*.quantity' => ['required', 'integer', 'min:1'],
            'date' => ['required', 'date_format:d-m-Y'],
            'step' => ['nullable', 'integer', 'min:1'],
        ]);

        $storeId = (int) $validated['store_id'];
        $packages = (array) $validated['packages'];

        $carbonDate = Carbon::createFromFormat(
            'd-m-Y',
            $validated['date']
        );

        $mysqlDate = $carbonDate->format('Y-m-d');

        /*
         |--------------------------------------------------------------------------
         | Package Duration
         |--------------------------------------------------------------------------
         */

        $duration = 0;
        foreach ($packages as $value) {
            $package = Package::find($value['id']);

            $duration += $package->duration * (int) $value['quantity'];
        }

        if ($duration <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'The selected package does not have a duration configured.',
            ], 422);
        }

        /*
         |--------------------------------------------------------------------------
         | Working Hours
         |--------------------------------------------------------------------------
         */
        $packageIds = array_column($packages, 'id');
        $startTimeStr = null;
        $endTimeStr = null;

        /*
         |--------------------------------------------------------------------------
         | Holiday Check
         |--------------------------------------------------------------------------
         */

        $holiday = Holiday::query()
            ->where('store_id', $storeId)
            ->whereDate('start_date', '<=', $mysqlDate)
            ->whereDate('end_date', '>=', $mysqlDate)
            ->first();

        if ($holiday) {

            if ($holiday->is_closed) {
                return response()->json([
                    'success' => true,
                    'slots' => [],
                ]);
            }

            $startTimeStr = Carbon::parse($holiday->open_time)->format('H:i');
            $endTimeStr = Carbon::parse($holiday->close_time)->format('H:i');
        } else {

            /*
             |--------------------------------------------------------------------------
             | Regular Store Hours
             |--------------------------------------------------------------------------
             */

            $dayName = strtolower($carbonDate->englishDayOfWeek);

            try {
                $dayOfWeek = DayOfWeek::from($dayName);
            } catch (\ValueError $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid date provided.',
                ], 422);
            }

            $storeHour = StoreHour::query()
                ->where('store_id', $storeId)
                ->where('day_of_week', $dayOfWeek)
                ->first();

            if (!$storeHour || $storeHour->is_closed) {
                return response()->json([
                    'success' => true,
                    'slots' => [],
                ]);
            }

            $startTimeStr = Carbon::parse($storeHour->start_time)->format('H:i');
            $endTimeStr = Carbon::parse($storeHour->end_time)->format('H:i');
        }

        if (!$startTimeStr || !$endTimeStr) {
            return response()->json([
                'success' => true,
                'slots' => [],
            ]);
        }

        /*
         |--------------------------------------------------------------------------
         | Open / Close Time
         |--------------------------------------------------------------------------
         */

        $openTime = Carbon::createFromFormat(
            'Y-m-d H:i',
            "{$mysqlDate} {$startTimeStr}"
        );

        $closeTime = Carbon::createFromFormat(
            'Y-m-d H:i',
            "{$mysqlDate} {$endTimeStr}"
        );

        if ($openTime->gte($closeTime)) {
            return response()->json([
                'success' => true,
                'slots' => [],
            ]);
        }

        /*
         |--------------------------------------------------------------------------
         | Step Size
         |--------------------------------------------------------------------------
         */

        $step = (int) ($validated['step'] ?? 30);

        /*
         |--------------------------------------------------------------------------
         | Package Capacity
         |--------------------------------------------------------------------------
         */

        $maxBookings = StorePackageCapacity::query()
            ->where('store_id', $storeId)
            ->whereIn('package_id', $packageIds)
            ->min('max_concurrent_bookings') ?? 1;

        /*
         |--------------------------------------------------------------------------
         | Existing Appointments
         |--------------------------------------------------------------------------
         */

        $appointments = OrderAppointment::query()
            ->where('store_id', $storeId)
            ->whereDate('date', $mysqlDate)
            ->whereIn('status', [
                'pending',
                'confirmed',
            ])
            ->whereHas('packages', function ($query) use ($packageIds) {
                $query->whereIn('packages.id', $packageIds);
            })->get();

        /*
         |--------------------------------------------------------------------------
         | Generate Slots
         |--------------------------------------------------------------------------
         */

        $slots = [];

        $currentTime = $openTime->copy();

        $today = Carbon::today();

        while (
            $currentTime->copy()
            ->addMinutes($duration)
            ->lte($closeTime)
        ) {

            $slotStart = $currentTime->copy();

            $slotEnd = $slotStart->copy()
                ->addMinutes($duration);

            $overlappingCount = 0;

            foreach ($appointments as $appointment) {

                $appointmentStart = Carbon::createFromFormat(
                    'Y-m-d H:i:s',
                    "{$mysqlDate} {$appointment->start_time}"
                );

                $appointmentEnd = Carbon::createFromFormat(
                    'Y-m-d H:i:s',
                    "{$mysqlDate} {$appointment->end_time}"
                );

                /*
                 |---------------------------------------------------------------
                 | Overlap:
                 | appointment_start < slot_end
                 | AND
                 | appointment_end > slot_start
                 |---------------------------------------------------------------
                 */

                if (
                    $appointmentStart->lt($slotEnd)
                    && $appointmentEnd->gt($slotStart)
                ) {
                    $overlappingCount++;
                }
            }

            $available = $overlappingCount < $maxBookings;

            /*
             |--------------------------------------------------------------------------
             | Prevent Past Bookings
             |--------------------------------------------------------------------------
             */

            if (
                $carbonDate->isToday()
                && $slotStart->lt(now())
            ) {
                $available = false;
            }

            $slots[] = [
                'start_time' => $slotStart->format('H:i'),
                'end_time' => $slotEnd->format('H:i'),
                'available' => $available,
                'remaining_capacity' => max(
                    0,
                    $maxBookings - $overlappingCount
                ),
            ];

            $currentTime->addMinutes($step);
        }

        return response()->json([
            'success' => true,
            'slots' => $slots,
            'duration' => $duration,
            'max_bookings' => $maxBookings,
        ]);
    }

    /**
     * Display a listing of the resource.
     */

    public function index()
    {
        return Inertia::render('Appointments/IndexAppointmentsPage', [
            'appointments' => OrderAppointment::with(['packages', 'store', 'order'])
                ->get()
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
            'appointment' =>  $appointment->with(['orderItem', 'store'])
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
