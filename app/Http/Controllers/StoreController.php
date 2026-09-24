<?php

namespace App\Http\Controllers;

use App\Enum\DayOfWeek;
use App\Models\Holiday;
use App\Models\Language;
use App\Models\Store;
use App\Models\StoreHour;
use App\Http\Requests\Store\StoreStoreRequest;
use App\Http\Requests\Store\UpdateStoreRequest;
use App\Http\Resources\Store\PublicStoreResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class StoreController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Store/StoresIndexPage', [
            'stores' => Store::all(),
        ]);
    }

    /**
     * Display a public listing of active stores.
     */
    public function publicIndex()
    {
        $stores = Store::with('translations')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return PublicStoreResource::collection($stores);
    }

    /**
     * Get store operating and pickup hours, checking holidays and weekly schedule
     * to provide all necessary date & time selection values for order pickup.
     */
    public function workingHours(Request $request): JsonResponse
    {
        $store = null;
        if (!empty($request->id) || !empty($request->store_id)) {
            $store = Store::find($request->id ?? $request->store_id);
        }

        if (!$store) {
            $store = Store::where('is_active', true)->first() ?? Store::first();
        }

        $storeId = $store?->id ?? 0;

        if (!$storeId) {
            return response()->json([
                'success' => true,
                'store_id' => 0,
                'store_name' => null,
                'is_closed' => true,
                'can_pickup' => false,
                'message' => 'No active store found.',
                'date' => null,
                'day' => null,
                'open_time' => null,
                'close_time' => null,
                'min_pickup_time' => null,
                'max_pickup_time' => null,
                'min_date' => null,
                'max_date' => null,
                'lead_time_minutes' => 30,
                'time_step' => 15,
                'time_options' => [],
                'is_holiday' => false,
                'holiday_name' => null,
                'working_hours' => null,
                'working_days' => [],
                'closed_days' => [],
                'disabled_dates' => [],
                'weekly_hours' => [],
                'holidays' => [],
                'slots' => [],
            ]);
        }

        /*
         |--------------------------------------------------------------------------
         | Weekly Store Hours & Working Days
         |--------------------------------------------------------------------------
         */
        $allStoreHours = StoreHour::query()
            ->where('store_id', $storeId)
            ->get();

        $weeklyHours = $allStoreHours->map(function ($sh) {
            $openTime = null;
            $closeTime = null;

            if (!empty($sh->start_time)) {
                $openTime = $sh->start_time instanceof \Carbon\CarbonInterface
                    ? $sh->start_time->format('H:i')
                    : Carbon::parse($sh->start_time)->format('H:i');
            }

            if (!empty($sh->end_time)) {
                $closeTime = $sh->end_time instanceof \Carbon\CarbonInterface
                    ? $sh->end_time->format('H:i')
                    : Carbon::parse($sh->end_time)->format('H:i');
            }

            $dayVal = $sh->day_of_week?->value ?? (string) $sh->day_of_week;

            return [
                'day' => strtolower($dayVal),
                'day_name' => ucfirst($dayVal),
                'is_closed' => (bool) $sh->is_closed,
                'open_time' => $openTime,
                'close_time' => $closeTime,
            ];
        });

        // Working and closed days of the week (e.g. ["Monday", "Tuesday", ...])
        $workingDays = $weeklyHours
            ->where('is_closed', false)
            ->pluck('day_name')
            ->values()
            ->all();

        $closedDays = $weeklyHours
            ->where('is_closed', true)
            ->pluck('day_name')
            ->values()
            ->all();

        // Upcoming / Active Holidays for this store
        $storeHolidays = Holiday::query()
            ->where('store_id', $storeId)
            ->get(['id', 'name', 'start_date', 'end_date', 'is_closed', 'open_time', 'close_time']);

        /*
         |--------------------------------------------------------------------------
         | Helper to resolve operating hours for any given date
         |--------------------------------------------------------------------------
         */
        $getStoreHoursForDate = function (Carbon $targetDate) use ($storeHolidays, $allStoreHours) {
            $targetMysqlDate = $targetDate->format('Y-m-d');
            $targetDayName = strtolower($targetDate->englishDayOfWeek);

            // 1. Check holiday
            $holiday = $storeHolidays->first(function ($h) use ($targetMysqlDate) {
                $startDate = $h->start_date instanceof Carbon ? $h->start_date->format('Y-m-d') : substr((string) $h->start_date, 0, 10);
                $endDate = $h->end_date instanceof Carbon
                    ? $h->end_date->format('Y-m-d')
                    : (!empty($h->end_date) ? substr((string) $h->end_date, 0, 10) : null);

                if (!empty($endDate)) {
                    return $targetMysqlDate >= $startDate && $targetMysqlDate <= $endDate;
                }
                return $targetMysqlDate === $startDate;
            });

            if ($holiday) {
                if ($holiday->is_closed) {
                    return [
                        'is_closed' => true,
                        'is_holiday' => true,
                        'holiday_name' => $holiday->name,
                        'open_time' => null,
                        'close_time' => null,
                        'message' => $holiday->name ? "Store is closed for {$holiday->name}." : 'Store is closed for a public holiday.',
                    ];
                }

                $openTime = !empty($holiday->open_time)
                    ? ($holiday->open_time instanceof Carbon ? $holiday->open_time->format('H:i') : Carbon::parse($holiday->open_time)->format('H:i'))
                    : null;
                $closeTime = !empty($holiday->close_time)
                    ? ($holiday->close_time instanceof Carbon ? $holiday->close_time->format('H:i') : Carbon::parse($holiday->close_time)->format('H:i'))
                    : null;

                return [
                    'is_closed' => empty($openTime) || empty($closeTime),
                    'is_holiday' => true,
                    'holiday_name' => $holiday->name,
                    'open_time' => $openTime,
                    'close_time' => $closeTime,
                    'message' => (empty($openTime) || empty($closeTime)) ? 'Working hours are not configured for this date.' : null,
                ];
            }

            // 2. Regular day of week
            $storeHour = $allStoreHours->first(function ($sh) use ($targetDayName) {
                $dayVal = $sh->day_of_week?->value ?? (string) $sh->day_of_week;
                return strtolower($dayVal) === $targetDayName;
            });

            if (!$storeHour || $storeHour->is_closed) {
                return [
                    'is_closed' => true,
                    'is_holiday' => false,
                    'holiday_name' => null,
                    'open_time' => null,
                    'close_time' => null,
                    'message' => "Store is closed on {$targetDate->englishDayOfWeek}.",
                ];
            }

            $openTime = !empty($storeHour->start_time)
                ? ($storeHour->start_time instanceof Carbon ? $storeHour->start_time->format('H:i') : Carbon::parse($storeHour->start_time)->format('H:i'))
                : null;
            $closeTime = !empty($storeHour->end_time)
                ? ($storeHour->end_time instanceof Carbon ? $storeHour->end_time->format('H:i') : Carbon::parse($storeHour->end_time)->format('H:i'))
                : null;

            return [
                'is_closed' => empty($openTime) || empty($closeTime),
                'is_holiday' => false,
                'holiday_name' => null,
                'open_time' => $openTime,
                'close_time' => $closeTime,
                'message' => (empty($openTime) || empty($closeTime)) ? 'Working hours are not configured for this date.' : null,
            ];
        };

        /*
         |--------------------------------------------------------------------------
         | Lead Time & Time Step Configuration
         |--------------------------------------------------------------------------
         */
        $leadTimeMinutes = max(0, (int) ($request->lead_time_minutes ?? $request->lead_time ?? 30));
        $step = max(5, (int) ($request->step ?? 15));
        $maxDays = max(1, (int) ($request->max_days ?? 60));

        /*
         |--------------------------------------------------------------------------
         | Determine Earliest (min_date) & Latest (max_date) Available Pickup Dates
         |--------------------------------------------------------------------------
         */
        $now = now();
        $minDateCarbon = $now->copy()->startOfDay();

        // Check if pickup is still possible today
        $todayHours = $getStoreHoursForDate($now);
        $todayCanPickup = false;

        if (!$todayHours['is_closed'] && !empty($todayHours['open_time']) && !empty($todayHours['close_time'])) {
            $todayCloseCarbon = Carbon::parse($now->format('Y-m-d') . ' ' . $todayHours['close_time']);
            $todayEarliest = $now->copy()->addMinutes($leadTimeMinutes);

            // Round up to nearest step
            $minute = (int) $todayEarliest->format('i');
            $remainder = $minute % $step;
            if ($remainder > 0) {
                $todayEarliest->addMinutes($step - $remainder)->second(0);
            } else {
                $todayEarliest->second(0);
            }

            if ($todayEarliest->lt($todayCloseCarbon)) {
                $todayCanPickup = true;
            }
        }

        // If today is closed or past closing/lead time, find the next available open date
        if (!$todayCanPickup) {
            for ($i = 1; $i <= 30; $i++) {
                $checkDate = $now->copy()->addDays($i)->startOfDay();
                $checkHours = $getStoreHoursForDate($checkDate);
                if (!$checkHours['is_closed'] && !empty($checkHours['open_time'])) {
                    $minDateCarbon = $checkDate;
                    break;
                }
            }
        }

        $minDate = $minDateCarbon->format('Y-m-d');
        $maxDate = $now->copy()->addDays($maxDays)->format('Y-m-d');

        /*
         |--------------------------------------------------------------------------
         | Disabled Specific Dates (Closed holidays within upcoming range)
         |--------------------------------------------------------------------------
         */
        $disabledDates = [];
        foreach ($storeHolidays as $h) {
            if ($h->is_closed) {
                $start = Carbon::parse($h->start_date);
                $end = !empty($h->end_date) ? Carbon::parse($h->end_date) : $start->copy();
                $curr = $start->copy();
                while ($curr->lte($end)) {
                    $disabledDates[] = $curr->format('Y-m-d');
                    $curr->addDay();
                }
            }
        }
        $disabledDates = array_values(array_unique($disabledDates));
        sort($disabledDates);

        /*
         |--------------------------------------------------------------------------
         | Parse Target Date
         |--------------------------------------------------------------------------
         */
        $dateInput = $request->date ?? $minDate;

        try {
            if (preg_match('/^(\d{1,2})[-\/](\d{1,2})$/', trim($dateInput), $matches)) {
                $day = (int) $matches[1];
                $month = (int) $matches[2];
                $year = (int) $now->year;

                $carbonDate = Carbon::createFromDate($year, $month, $day)->startOfDay();
                if ($carbonDate->lt($now->copy()->startOfDay()->subMonths(2))) {
                    $carbonDate->addYear();
                }
            } elseif (preg_match('/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/', trim($dateInput), $matches)) {
                $carbonDate = Carbon::createFromDate((int) $matches[3], (int) $matches[2], (int) $matches[1])->startOfDay();
            } elseif (preg_match('/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/', trim($dateInput), $matches)) {
                $carbonDate = Carbon::createFromDate((int) $matches[1], (int) $matches[2], (int) $matches[3])->startOfDay();
            } else {
                $carbonDate = Carbon::parse($dateInput)->startOfDay();
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid date provided.',
            ], 422);
        }

        $mysqlDate = $carbonDate->format('Y-m-d');
        $englishDayOfWeek = $carbonDate->englishDayOfWeek;

        /*
         |--------------------------------------------------------------------------
         | Evaluate Target Date Pickup Time Values
         |--------------------------------------------------------------------------
         */
        $dateInfo = $getStoreHoursForDate($carbonDate);
        $isClosed = $dateInfo['is_closed'];
        $isHoliday = $dateInfo['is_holiday'];
        $holidayName = $dateInfo['holiday_name'];
        $message = $dateInfo['message'];

        $openTimeStr = $dateInfo['open_time'];
        $closeTimeStr = $dateInfo['close_time'];

        $canPickup = false;
        $minPickupTime = null;
        $maxPickupTime = null;
        $timeOptions = [];

        if (!$isClosed && !empty($openTimeStr) && !empty($closeTimeStr)) {
            try {
                $openCarbon = Carbon::parse("{$mysqlDate} {$openTimeStr}");
                $closeCarbon = Carbon::parse("{$mysqlDate} {$closeTimeStr}");
            } catch (\Exception $e) {
                $openCarbon = null;
                $closeCarbon = null;
            }

            if ($openCarbon && $closeCarbon && $openCarbon->lt($closeCarbon)) {
                if ($carbonDate->isToday()) {
                    $earliestCarbon = $now->copy()->addMinutes($leadTimeMinutes);

                    // Round earliest time up to the next step
                    $minute = (int) $earliestCarbon->format('i');
                    $remainder = $minute % $step;
                    if ($remainder > 0) {
                        $earliestCarbon->addMinutes($step - $remainder)->second(0);
                    } else {
                        $earliestCarbon->second(0);
                    }

                    if ($earliestCarbon->lt($openCarbon)) {
                        $earliestCarbon = $openCarbon->copy();
                    }

                    if ($earliestCarbon->gte($closeCarbon)) {
                        $canPickup = false;
                        $message = 'Pickup is no longer available for today. The earliest pickup time has passed store hours.';
                    } else {
                        $canPickup = true;
                        $minPickupTime = $earliestCarbon->format('H:i');
                        $maxPickupTime = $closeCarbon->format('H:i');
                        $pickupCursor = $earliestCarbon->copy();
                    }
                } elseif ($carbonDate->isPast()) {
                    $canPickup = false;
                    $isClosed = true;
                    $message = 'Selected date is in the past.';
                } else {
                    $canPickup = true;
                    $minPickupTime = $openCarbon->format('H:i');
                    $maxPickupTime = $closeCarbon->format('H:i');
                    $pickupCursor = $openCarbon->copy();
                }

                if ($canPickup && isset($pickupCursor)) {
                    while ($pickupCursor->lte($closeCarbon)) {
                        $timeOptions[] = $pickupCursor->format('H:i');
                        $pickupCursor->addMinutes($step);
                    }
                }
            } else {
                $isClosed = true;
                $message = 'Store hours are invalid for this date.';
            }
        }

        return response()->json([
            'success' => true,
            'store_id' => $storeId,
            'store_name' => $store->name,
            'date' => $mysqlDate,
            'day' => $englishDayOfWeek,
            'is_closed' => $isClosed,
            'can_pickup' => $canPickup,
            'is_holiday' => $isHoliday,
            'holiday_name' => $holidayName,
            'message' => $message,
            'open_time' => $openTimeStr,
            'close_time' => $closeTimeStr,
            'min_pickup_time' => $minPickupTime,
            'max_pickup_time' => $maxPickupTime,
            'min_date' => $minDate,
            'max_date' => $maxDate,
            'lead_time_minutes' => $leadTimeMinutes,
            'time_step' => $step,
            'time_options' => $timeOptions,
            'working_days' => $workingDays,
            'closed_days' => $closedDays,
            'disabled_dates' => $disabledDates,
            'weekly_hours' => $weeklyHours,
            'holidays' => $storeHolidays,
            'working_hours' => [
                'open_time' => $openTimeStr,
                'close_time' => $closeTimeStr,
                'is_holiday' => $isHoliday,
                'holiday_name' => $holidayName,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Store/StoreFormPage', [
            'store' => null,
            'workHours' => [],
            'translations' => [],
            'languages' => Language::active()->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStoreRequest $request)
    {
        $validatedData = $request->validated();

        $store = Store::create(
            Arr::except($validatedData, ['working_hours', 'translations'])
        );

        foreach ($validatedData['working_hours'] ?? [] as $hour) {
            $store->storeHours()->create($hour);
        }

        $this->syncTranslations($store, $validatedData['translations'] ?? []);

        return redirect()
            ->route('stores.edit', $store->id)
            ->with('success', 'Store created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Store $store)
    {
        $workingHours = StoreHour::where("store_id", $store->id)->get();
        return Inertia::render('Store/StoreFormPage', [
            'store' => $store,
            'workHours' => $workingHours,
            'translations' => $store->translations()->get(),
            'languages' => Language::active()->get(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Store $store)
    {
        $workingHours = StoreHour::where("store_id", $store->id)->get();
        return Inertia::render('Store/StoreFormPage', [
            'store' => $store,
            'workHours' => $workingHours,
            'translations' => $store->translations()->get(),
            'languages' => Language::active()->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStoreRequest $request, Store $store)
    {
        $validatedData = $request->validated();


        $store->update(
            Arr::except($validatedData, ['working_hours', 'translations'])
        );

        $store->storeHours()->delete();

        foreach ($validatedData['working_hours'] ?? [] as $hour) {
            $store->storeHours()->create($hour);
        }

        $this->syncTranslations($store, $validatedData['translations'] ?? []);

        return redirect()->route('stores.index')
            ->with('success', 'Store updated successfully');
    }

    /**
     * Replace the store's address translations.
     *
     * @param  array<int, array{locale: string, address: ?string}>  $translations
     */
    private function syncTranslations(Store $store, array $translations): void
    {
        $store->translations()->delete();

        foreach ($translations as $translation) {
            if (empty($translation['locale'])) {
                continue;
            }

            if (empty($translation['name']) && empty($translation['address'])) {
                continue;
            }

            $store->translations()->create([
                'locale' => $translation['locale'],
                'name' => $translation['name'] ?? null,
                'address' => $translation['address'] ?? null,
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Store $store)
    {
        $store->delete();
        return redirect()->route('promo-codes.index')->with('success', 'Promo code deleted successfully.');
    }
}
