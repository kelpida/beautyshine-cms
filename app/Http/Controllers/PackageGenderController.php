<?php

namespace App\Http\Controllers;

use App\Http\Resources\Package\PackageDetailsResource;
use App\Models\Language;
use App\Models\PackageGender;
use App\Http\Requests\Package\Gender\StorePackageGenderRequest;
use App\Http\Requests\Package\Gender\UpdatePackageGenderRequest;
use Inertia\Inertia;

class PackageGenderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $packageGenders = PackageGender::where('deleted_at', null)->with('translates')->get();
        return Inertia::render('Package/Genders/GendersIndexPage', [
            'packageGenders' => PackageDetailsResource::collection($packageGenders)
        ]);
    }

    /**
     * Display a listing of the public api resource.
     */
    public function publicIndex()
    {
        $packageGenders = PackageGender::where('deleted_at', null)->with('translates')->get();
        return PackageDetailsResource::collection($packageGenders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePackageGenderRequest $request)
    {
        $packageGenderValidation = $request->validated();

        // Find the 'en' translation first
        $enTranslate = collect($packageGenderValidation['translates'])
            ->firstWhere('locale', 'en');

        if (!$enTranslate) {
            return redirect()->back()->withErrors(['translates' => 'English translation is required.']);
        }

        // Create the main package gender with the 'en' translation
        $packageGender = PackageGender::create([
            'name' => $enTranslate['name'],
            'key' => $packageGenderValidation['key'],
        ]);

        // Create the other translations
        foreach ($packageGenderValidation['translates'] as $translate) {
            if ($translate['locale'] != 'en') {
                $packageGender->translates()->create($translate);
            }
        }

        return redirect()->route('package-genders.index')
            ->with('success', 'Package gender created successfully.');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Package/Genders/GendersFormPage', [
            'packageGender' => null,
            'languages' => Language::where('is_active', true)->whereNull('deleted_at')->get(),
        ]);
    }

    public function update(UpdatePackageGenderRequest $request, PackageGender $gender)
    {
        $data = $request->validated();

        // Update main 'en' package gender
        $enTranslate = collect($data['translates'])->firstWhere('locale', 'en');

        if (!$enTranslate) {
            return redirect()->back()->withErrors(['translates' => 'English translation is required.']);
        }

        $gender->update([
            'name' => $enTranslate['name'],
            'key' => $data['key'],
        ]);

        if (isset($data['translates']) && is_array($data['translates'])) {
            $localesFromRequest = collect($data['translates'])
                ->where('locale', '!=', 'en')
                ->pluck('locale')
                ->toArray();

            $gender->translates()
                ->whereNotIn('locale', $localesFromRequest)
                ->delete();

            foreach ($data['translates'] as $translate) {
                if ($translate['locale'] === 'en') continue;

                $gender->translates()->updateOrCreate(
                    ['locale' => $translate['locale']],
                    ['name' => $translate['name']]
                );
            }
        }

        return redirect()->route('package-genders.index')->with('success', 'Package gender updated successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $packageGender = PackageGender::with('translates')->findOrFail($id);
        return Inertia::render('Package/Genders/GendersFormPage', [
            'packageGender' => new PackageDetailsResource($packageGender),
            'languages' => Language::where('is_active', true)->whereNull('deleted_at')->get(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $packageGender = PackageGender::with('translates')->findOrFail($id);
        return Inertia::render('Package/Genders/GendersFormPage', [
            'packageGender' => new PackageDetailsResource($packageGender),
            'languages' => Language::where('is_active', true)->whereNull('deleted_at')->get(),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $packageGender = PackageGender::findOrFail($id);
        $packageGender->delete();
        return redirect()->route('package-genders.index')->with('success', 'Package gender deleted successfully.');
    }
}
