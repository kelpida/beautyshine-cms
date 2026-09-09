<?php

namespace App\Http\Controllers;

use App\Http\Resources\Package\PackageDetailsResource;
use App\Models\Language;
use App\Models\PackageStatus;
use App\Http\Requests\Package\Status\StorePackageStatusRequest;
use App\Http\Requests\Package\Status\UpdatePackageStatusRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class PackageStatusController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $packageStatuses = PackageStatus::where('deleted_at', null)->with('translates')->get();
        return Inertia::render('Package/Status/StatusIndexPage', [
            'packageStatuses' => PackageDetailsResource::collection($packageStatuses)
        ]);
    }

    /**
     * Display a listing of the public api resource.
     */
    public function publicIndex()
    {
        $packageStatuses = PackageStatus::where('deleted_at', null)->with('translates')->get();
        return PackageDetailsResource::collection($packageStatuses);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $packageStatuses = PackageStatus::all();
        return Inertia::render('Package/Status/StatusFormPage', [
            'packageStatuses' => $packageStatuses,
            'languages' => Language::where('is_active', true)->whereNull('deleted_at')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePackageStatusRequest $request)
    {
        $packageStatusValidation = $request->validated();

        // Find the 'en' translation first
        $enTranslate = collect($packageStatusValidation['translates'])
            ->firstWhere('locale', 'en');

        if (!$enTranslate) {
            return redirect()->back()->withErrors(['translates' => 'English translation is required.']);
        }

        // Create the main package status with the 'en' translation
        $packageStatus = PackageStatus::create([
            'name' => $enTranslate['name'],
            'key' => $packageStatusValidation['key'],
        ]);

        // Create the other translations
        foreach ($packageStatusValidation['translates'] as $translate) {
            if ($translate['locale'] != 'en') {
                $packageStatus->translates()->create($translate);
            }
        }

        return redirect()->route('package-statuses.index')
            ->with('success', 'Package status created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $packageStatus = PackageStatus::with('translates')->findOrFail($id);
        return Inertia::render('Package/Status/StatusFormPage', [
            'packageStatus' => new PackageDetailsResource($packageStatus),
            'languages' => Language::where('is_active', true)->whereNull('deleted_at')->get(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $packageStatus = PackageStatus::with('translates')->findOrFail($id);
        return Inertia::render('Package/Status/StatusFormPage', [
            'packageStatus' => new PackageDetailsResource($packageStatus),
            'languages' => Language::where('is_active', true)->whereNull('deleted_at')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePackageStatusRequest $request, PackageStatus $status)
    {
        $data = $request->validated();

        // Update main 'en' package status
        $enTranslate = collect($data['translates'])->firstWhere('locale', 'en');

        if (!$enTranslate) {
            return redirect()->back()->withErrors(['translates' => 'English translation is required.']);
        }

        $status->update([
            'name' => $enTranslate['name'],
            'key' => $data['key'],
        ]);

        if (isset($data['translates']) && is_array($data['translates'])) {
            $localesFromRequest = collect($data['translates'])
                ->where('locale', '!=', 'en')
                ->pluck('locale')
                ->toArray();

            $status->translates()
                ->whereNotIn('locale', $localesFromRequest)
                ->delete();

            foreach ($data['translates'] as $translate) {
                if ($translate['locale'] === 'en') continue;

                $status->translates()->updateOrCreate(
                    ['locale' => $translate['locale']],
                    ['name' => $translate['name']]
                );
            }
        }

        return redirect()->route('package-statuses.index')->with('success', 'Package status updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $packageStatus = PackageStatus::findOrFail($id);
        $packageStatus->delete();
        return redirect()->route('package-statuses.index')->with('success', 'Package status deleted successfully.');
    }
}
