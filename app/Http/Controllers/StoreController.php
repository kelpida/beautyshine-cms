<?php

namespace App\Http\Controllers;

use App\Models\Store;
use App\Http\Requests\Store\StoreStoreRequest;
use App\Http\Requests\Store\UpdateStoreRequest;
use App\Http\Resources\Store\PublicStoreResource;
use App\Models\StoreHour;
use Illuminate\Support\Arr;
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
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Store/StoresFormPage', [
            'store' => null
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStoreRequest $request)
    {
        $validatedData = $request->validated();

        $store = Store::create(
            Arr::except($validatedData, ['translations'])
        );

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
