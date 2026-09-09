<?php

namespace App\Http\Controllers;

use App\Http\Resources\Package\PackageDetailsResource;
use App\Models\Language;
use App\Models\PackageAge;
use App\Http\Requests\Package\Age\StorePackageAgeRequest;
use App\Http\Requests\Package\Age\UpdatePackageAgeRequest;
use Inertia\Inertia;

class PackageAgeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $packageAges = PackageAge::where('deleted_at', null)->with('translates')->get();
        return Inertia::render('Package/Ages/AgesIndexPage', [
            'packageAges' => PackageDetailsResource::collection($packageAges)
        ]);
    }

    /**
     * Display a listing of the public api resource.
     */
    public function publicIndex()
    {
        $packageAges = PackageAge::where('deleted_at', null)->with('translates')->get();
        return PackageDetailsResource::collection($packageAges);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePackageAgeRequest $request)
    {
        $packageAgeValidation = $request->validated();
        $translations = collect($packageAgeValidation['translates']);

        // Find the 'en' translation first
        $enTranslate = $translations
            ->firstWhere('locale', 'en');

        if (!$enTranslate) {
            return redirect()->back()->withErrors(['translates' => 'English translation is required.']);
        }

        // Create the main package age with the 'en' translation
        $packageAge = PackageAge::create([
            'name' => $enTranslate['name'],
            'key' => $packageAgeValidation['key'],
        ]);

        $nonEnLocales = $translations
            ->pluck('locale')
            ->filter(fn($locale) => $locale && $locale !== 'en')
            ->unique()
            ->values();

        $languageIdsByCode = Language::whereIn('code', $nonEnLocales)
            ->pluck('id', 'code');

        $missingLocales = $nonEnLocales
            ->filter(fn($locale) => !isset($languageIdsByCode[$locale]))
            ->values();

        if ($missingLocales->isNotEmpty()) {
            return redirect()->back()->withErrors([
                'translates' => 'Unknown language locale(s): ' . $missingLocales->implode(', '),
            ])->withInput();
        }

        // Create the other translations
        foreach ($translations as $translate) {
            if (($translate['locale'] ?? null) === 'en') continue;

            $languageId = $languageIdsByCode[$translate['locale']] ?? null;
            if (!$languageId) continue;

            $packageAge->translates()->create([
                'language_id' => $languageId,
                'name' => $translate['name'],
            ]);
        }

        return redirect()->route('package-ages.index')
            ->with('success', 'Package age created successfully.');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Package/Ages/AgesFormPage', [
            'packageAge' => null,
            'languages' => Language::where('is_active', true)->whereNull('deleted_at')->get(),
        ]);
    }

    public function update(UpdatePackageAgeRequest $request, PackageAge $age)
    {
        $data = $request->validated();
        $translations = collect($data['translates'] ?? []);

        // Update main 'en' package age
        $enTranslate = $translations->firstWhere('locale', 'en');

        if (!$enTranslate) {
            return redirect()->back()->withErrors(['translates' => 'English translation is required.']);
        }

        $age->update([
            'name' => $enTranslate['name'],
            'key' => $data['key'],
        ]);

        if ($translations->isNotEmpty()) {
            $localesFromRequest = $translations
                ->where('locale', '!=', 'en')
                ->pluck('locale')
                ->filter()
                ->unique()
                ->values();

            $languageIdsByCode = Language::whereIn('code', $localesFromRequest)
                ->pluck('id', 'code');

            $missingLocales = $localesFromRequest
                ->filter(fn($locale) => !isset($languageIdsByCode[$locale]))
                ->values();

            if ($missingLocales->isNotEmpty()) {
                return redirect()->back()->withErrors([
                    'translates' => 'Unknown language locale(s): ' . $missingLocales->implode(', '),
                ])->withInput();
            }

            $languageIdsFromRequest = $localesFromRequest
                ->map(fn($locale) => $languageIdsByCode[$locale] ?? null)
                ->filter()
                ->values()
                ->all();

            $age->translates()
                ->whereNotIn('language_id', $languageIdsFromRequest)
                ->delete();

            foreach ($translations as $translate) {
                if (($translate['locale'] ?? null) === 'en') continue;

                $languageId = $languageIdsByCode[$translate['locale']] ?? null;
                if (!$languageId) continue;

                $age->translates()->updateOrCreate(
                    ['language_id' => $languageId],
                    ['name' => $translate['name']]
                );
            }
        }

        return redirect()->route('package-ages.index')->with('success', 'Package age updated successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $packageAge = PackageAge::with(['translates.language'])->findOrFail($id);
        $packageAge->translates->transform(function ($translate) {
            $translate->locale = $translate->language->code ?? null;
            return $translate;
        });

        return Inertia::render('Package/Ages/AgesFormPage', [
            'packageAge' => new PackageDetailsResource($packageAge),
            'languages' => Language::where('is_active', true)->whereNull('deleted_at')->get(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $packageAge = PackageAge::with(['translates.language'])->findOrFail($id);
        $packageAge->translates->transform(function ($translate) {
            $translate->locale = $translate->language->code ?? null;
            return $translate;
        });

        return Inertia::render('Package/Ages/AgesFormPage', [
            'packageAge' => new PackageDetailsResource($packageAge),
            'languages' => Language::where('is_active', true)->whereNull('deleted_at')->get(),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $packageAge = PackageAge::findOrFail($id);
        $packageAge->delete();
        return redirect()->route('package-ages.index')->with('success', 'Package age deleted successfully.');
    }
}
