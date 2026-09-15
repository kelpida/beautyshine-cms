<?php

namespace App\Http\Controllers;

use App\Models\Eshop\EshopCategory;
use App\Http\Requests\StoreEshopCategoryRequest;
use App\Http\Requests\UpdateEshopCategoryRequest;
use App\Models\Eshop\EshopCategoryTranslate;
use App\Models\Language;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EshopCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return Inertia::render('Eshop/Category/IndexEshopCategoryPage', [
            'eshopCategories' => EshopCategory::query()
                ->with(['parent', 'image'])
                ->when($request->q, function ($query) use ($request) {
                    $query->where('name', 'like', '%' . $request->q . '%');
                })
                ->orderBy('sort_order', 'asc')
                ->paginate(20, ['*'], 'page', $request->page),

            'filters' => [
                'q' => $request->q,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $languages = Language::active()->get();
        return Inertia::render('Eshop/Category/FormEshopCategoryPage', [
            'languages' => $languages,
            'eshopCategory' => null,
            'nextSortOrder' => EshopCategory::nextSortOrder(),
            'parentCategories' => EshopCategory::query()
                ->active()
                ->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEshopCategoryRequest $request)
    {
        $validatedData = $request->validated();

        $category = EshopCategory::create([
            'name' => $validatedData['name'],
            'slug' => $validatedData['slug'],
            'description' => $validatedData['description'] ?? null,
            'is_active' => $validatedData['is_active'],
            'parent_id' => $validatedData['parent_id'] ?? null,
            'image_id' => $validatedData['image_id'] ?? null,
            'sort_order' => $validatedData['sort_order'] ?? EshopCategory::nextSortOrder(),
        ]);

        if (!empty($validatedData['translations']) && is_array($validatedData['translations'])) {
            foreach ($validatedData['translations'] as $translation) {
                if (isset($translation['locale']) && $translation['locale'] !== 'en') {
                    $category->translates()->create([
                        'locale' => $translation['locale'],
                        'name' => $translation['name'],
                        'description' => $translation['description'] ?? null,
                    ]);
                }
            }
        }
        
        return redirect()->route('eshop-categories.index')->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(EshopCategory $eshopCategory)
    {
        return $this->edit($eshopCategory);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EshopCategory $eshopCategory)
    {
        $languages = Language::active()->get();
        return Inertia::render('Eshop/Category/FormEshopCategoryPage', [
            'languages' => $languages,
            'eshopCategory' => $eshopCategory->load(['translates', 'image', 'parent']),
            'parentCategories' => EshopCategory::query()
                ->active()
                ->where('id', '!=', $eshopCategory->id)
                ->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEshopCategoryRequest $request, EshopCategory $eshopCategory)
    {
        $validatedData = $request->validated();

        $eshopCategory->update([
            'name' => $validatedData['name'],
            'slug' => $validatedData['slug'],
            'description' => $validatedData['description'] ?? null,
            'is_active' => $validatedData['is_active'],
            'parent_id' => $validatedData['parent_id'] ?? null,
            'image_id' => $validatedData['image_id'] ?? null,
            'sort_order' => $validatedData['sort_order'] ?? $eshopCategory->sort_order,
        ]);

        if (isset($validatedData['translations']) && is_array($validatedData['translations'])) {
            $eshopCategory->translates()->delete();
            foreach ($validatedData['translations'] as $translation) {
                if (isset($translation['locale']) && $translation['locale'] !== 'en') {
                    $eshopCategory->translates()->create([
                        'locale' => $translation['locale'],
                        'name' => $translation['name'],
                        'description' => $translation['description'] ?? null,
                    ]);
                }
            }
        }

        return redirect()->route('eshop-categories.index')->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EshopCategory $eshopCategory)
    {
        $eshopCategory->delete();
        return redirect()->route('eshop-categories.index')->with('success', 'Category deleted successfully.');
    }
}
