<?php

namespace App\Http\Controllers;

use App\Http\Requests\Package\Attribute\StoreAttributeCategoryRequest;
use App\Http\Requests\Package\Attribute\UpdateAttributeCategoryRequest;
use App\Http\Resources\Package\Attributes\AttributeCategoryResource;
use App\Http\Resources\Package\Attributes\PublicAttributeCategoryResource;
use App\Models\AttributeCategory;

use App\Models\Language;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AttributeCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $attributeCategories = AttributeCategory::with('translates')->get();
        return Inertia::render('Package/AttributeCategories/AttributeCategoriesIndexPage', [
            'attributeCategories' => AttributeCategoryResource::collection($attributeCategories)
        ]);
    }

    public function publicIndex()
    {
        $attributeCategories = AttributeCategory::whereNull('deleted_at')
            ->where('key', '!=', 'hidden-information') // 👈 hide category
            ->with([
                'translates',
                'attributes' => function ($q) {
                    $q->whereNull('deleted_at'); // optional
                },
                'attributes.translates',
                'attributes.options' => function ($q) {
                    $q->whereNull('deleted_at'); // optional
                },
            ])
            ->get();
        return PublicAttributeCategoryResource::collection($attributeCategories);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Package/AttributeCategories/AttributeCategoriesFormPage', ['attributeCategory' => new AttributeCategory(), 'languages' => Language::where('is_active', true && 'deleted_at', null)->get()]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAttributeCategoryRequest $request)
    {
        $attributeCategoryValidation = $request->validated();

        // Find the 'en' translation first
        $enTranslate = collect($attributeCategoryValidation['translates'])
            ->firstWhere('locale', 'en');

        if (!$enTranslate) {
            // Handle error if 'en' translation is required
            return redirect()->back()->withErrors(['translates' => 'English translation is required.']);
        }

        // Create the main property type with the 'en' translation
        $attributeCategory = AttributeCategory::create([
            'name' => $enTranslate['name'],
            'key' => $attributeCategoryValidation['key'],
        ]);

        // Now create the other translations
        foreach ($attributeCategoryValidation['translates'] as $translate) {
            if ($translate['locale'] != 'en') {
                $attributeCategory->translates()->create($translate);
            }
        }
        return redirect()->route('attribute-categories.index')->with('success', 'Attribute Category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $attributeCategory = AttributeCategory::with('translates')->findOrFail($id);
        return Inertia::render('Package/AttributeCategories/AttributeCategoriesFormPage', [
            'attributeCategory' => new AttributeCategoryResource($attributeCategory),
            'languages' => Language::where('is_active', true && 'deleted_at', null)->get(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $attributeCategory = AttributeCategory::with('translates')->findOrFail($id);
        return Inertia::render('Package/AttributeCategories/AttributeCategoriesFormPage', [
            'attributeCategory' => new AttributeCategoryResource($attributeCategory),
            'languages' => Language::where('is_active', true && 'deleted_at', null)->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAttributeCategoryRequest $request, AttributeCategory $attributeCategory)
    {
        $attributeCategoryValidation = $request->validated();

        // Find the 'en' translation first
        $enTranslate = collect($attributeCategoryValidation['translates'])
            ->firstWhere('locale', 'en');

        if (!$enTranslate) {
            return redirect()->back()->withErrors(['translates' => 'English translation is required.']);
        }

        DB::transaction(function () use ($attributeCategory, $attributeCategoryValidation, $enTranslate) {
            // Update the main attribute category
            $attributeCategory->update([
                'name' => $enTranslate['name'],
                'key' => $attributeCategoryValidation['key'],
            ]);

            // Update attribute category translations
            foreach ($attributeCategoryValidation['translates'] as $translate) {
                if ($translate['locale'] != 'en') {
                    $attributeCategory->translates()->updateOrCreate(
                        ['locale' => $translate['locale']],
                        ['name' => $translate['name']]
                    );
                }
            }
        });
        return redirect()->route('attribute-categories.index')->with('success', 'Attribute Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AttributeCategory $attributeCategory)
    {
        $attributeCategory->delete();
        return redirect()->route('attribute-categories.index')->with('success', 'Attribute Category deleted successfully.');
    }
}
