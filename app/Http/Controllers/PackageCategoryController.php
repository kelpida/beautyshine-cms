<?php

namespace App\Http\Controllers;

use App\Http\Resources\Package\PackageDetailsResource;
use App\Http\Resources\Package\Categories\CategoriesResource;
use App\Models\Language;
use App\Models\PackageCategory;
use App\Http\Requests\Package\Category\StorePackageCategoryRequest;
use App\Http\Requests\Package\Category\UpdatePackageCategoryRequest;
use Inertia\Inertia;

class PackageCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $packageCategories = PackageCategory::where('deleted_at', null)->with('translates')->get();
        return Inertia::render('Package/Categories/CategoriesIndexPage', [
            'packageCategories' => PackageDetailsResource::collection($packageCategories)
        ]);
    }

    /**
     * Display a listing of the public api resource.
     */
    public function publicIndex()
    {
        $packageCategories = PackageCategory::where('deleted_at', null)->with('translates')->get();
        return PackageDetailsResource::collection($packageCategories);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePackageCategoryRequest $request)
    {
        $packageCategoryValidation = $request->validated();

        // Find the 'en' translation first
        $enTranslate = collect($packageCategoryValidation['translates'])
            ->firstWhere('locale', 'en');

        if (!$enTranslate) {
            return redirect()->back()->withErrors(['translates' => 'English translation is required.']);
        }

        // Create the main package category with the 'en' translation
        $packageCategory = PackageCategory::create([
            'name' => $enTranslate['name'],
            'key' => $packageCategoryValidation['key'],
        ]);

        // Create the other translations
        foreach ($packageCategoryValidation['translates'] as $translate) {
            if ($translate['locale'] != 'en') {
                $packageCategory->translates()->create($translate);
            }
        }

        return redirect()->route('package-categories.index')
            ->with('success', 'Package category created successfully.');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Package/Categories/CategoriesFormPage', [
            'packageCategory' => null,
            'languages' => Language::where('is_active', true)->whereNull('deleted_at')->get(),
        ]);
    }

    public function update(UpdatePackageCategoryRequest $request, PackageCategory $category)
    {
        $data = $request->validated();

        // Update main 'en' package category
        $enTranslate = collect($data['translates'])->firstWhere('locale', 'en');

        if (!$enTranslate) {
            return redirect()->back()->withErrors(['translates' => 'English translation is required.']);
        }

        $category->update([
            'name' => $enTranslate['name'],
            'key' => $data['key'],
        ]);

        if (isset($data['translates']) && is_array($data['translates'])) {
            $localesFromRequest = collect($data['translates'])
                ->where('locale', '!=', 'en')
                ->pluck('locale')
                ->toArray();

            $category->translates()
                ->whereNotIn('locale', $localesFromRequest)
                ->delete();

            foreach ($data['translates'] as $translate) {
                if ($translate['locale'] === 'en') continue;

                $category->translates()->updateOrCreate(
                    ['locale' => $translate['locale']],
                    ['name' => $translate['name']]
                );
            }
        }

        return redirect()->route('package-categories.index')->with('success', 'Package category updated successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $packageCategory = PackageCategory::with('translates')->findOrFail($id);
        return Inertia::render('Package/Categories/CategoriesFormPage', [
            'packageCategory' => new PackageDetailsResource($packageCategory),
            'languages' => Language::where('is_active', true)->whereNull('deleted_at')->get(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $packageCategory = PackageCategory::with('translates')->findOrFail($id);
        return Inertia::render('Package/Categories/CategoriesFormPage', [
            'packageCategory' => new PackageDetailsResource($packageCategory),
            'languages' => Language::where('is_active', true)->whereNull('deleted_at')->get(),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $packageCategory = PackageCategory::findOrFail($id);
        $packageCategory->delete();
        return redirect()->route('package-categories.index')->with('success', 'Package category deleted successfully.');
    }
}
