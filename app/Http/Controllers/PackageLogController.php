<?php

namespace App\Http\Controllers;

use App\Models\PackageLog;
use App\Http\Requests\StorePackageLogRequest;
use App\Http\Requests\UpdatePackageLogRequest;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackageLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $from = Carbon::parse($request->input('from', now()->subMonth()))->startOfDay();
        $to = Carbon::parse($request->input('to', now()))->endOfDay();

        $getData = function ($eventType) use ($from, $to) {
            return PackageLog::select(
                'packages.name as label',
                'packages.id as id',
                DB::raw('COUNT(package_logs.id) as value')
            )
                ->join('packages', 'packages.id', '=', 'package_logs.package_id')
                ->where('package_logs.event_type', $eventType)
                ->whereBetween('package_logs.created_at', [$from, $to])
                ->groupBy('packages.id', 'packages.name')
                ->orderByDesc('value')
                ->limit(10)
                ->get();
        };

        return Inertia::render('Dashboard/DashboardPage', [
            'visitsChart' => $getData('view'),
            'wishlistChart' => $getData('wishlist'),
            'shareChart' => $getData('share'),
            'filters' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePackageLogRequest $request)
    {
        $validated = $request->validated();

        $alreadyLogged = PackageLog::where('visitor_id', $validated['visitor_id'])
            ->where('package_id', $validated['package_id'])
            ->where('event_type', $validated['event_type'])
            ->whereDate('created_at', Carbon::today())
            ->exists();

        if ($alreadyLogged) {
            return response()->json([
                'message' => 'Visit already logged today',
            ], 200);
        }

        PackageLog::create($validated);

        return response()->json([
            'message' => 'Package log created successfully',
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(PackageLog $packageLog)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PackageLog $packageLog)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePackageLogRequest $request, PackageLog $packageLog)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PackageLog $packageLog)
    {
        //
    }
}
