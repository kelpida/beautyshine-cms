<?php

namespace App\Http\Controllers;

use App\Models\Eshop\Attribute;
use App\Http\Requests\Eshop\Attribute\StoreAttributeRequest;
use App\Http\Requests\Eshop\Attribute\UpdateAttributeRequest;
use App\Models\Language;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttributeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return Inertia::render('Eshop/Attribute/IndexAttributePage', [
            'eshopAttributes' => Attribute::query()
                ->when($request->q, function ($query) use ($request) {
                    $query->where('name', 'like', '%' . $request->q . '%')
                        ->orWhere('slug', 'like', '%' . $request->q . '%');
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
        return Inertia::render('Eshop/Attribute/FormAttributePage', [
            'languages' => $languages,
            'eshopAttribute' => null,
            'nextSortOrder' => Attribute::nextSortOrder(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAttributeRequest $request)
    {
        $validatedData = $request->validated();

        $attribute = Attribute::create([
            'name' => $validatedData['name'],
            'slug' => $validatedData['slug'],
            'format_type' => $validatedData['format_type'] ?? 'select',
            'sort_order' => $validatedData['sort_order'] ?? Attribute::nextSortOrder(),
            'is_active' => $validatedData['is_active'],
        ]);

        if (!empty($validatedData['translations']) && is_array($validatedData['translations'])) {
            foreach ($validatedData['translations'] as $translation) {
                if (isset($translation['locale']) && $translation['locale'] !== 'en') {
                    $attribute->translates()->create([
                        'locale' => $translation['locale'],
                        'name' => $translation['name'],
                    ]);
                }
            }
        }

        return redirect()->route('eshop-attributes.index')->with('success', 'Attribute created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Attribute $eshop_attribute)
    {
        return $this->edit($eshop_attribute);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Attribute $eshop_attribute)
    {
        $languages = Language::active()->get();
        return Inertia::render('Eshop/Attribute/FormAttributePage', [
            'languages' => $languages,
            'eshopAttribute' => $eshop_attribute->load('translates'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAttributeRequest $request, Attribute $eshop_attribute)
    {
        $validatedData = $request->validated();

        $eshop_attribute->update([
            'name' => $validatedData['name'],
            'slug' => $validatedData['slug'],
            'format_type' => $validatedData['format_type'] ?? $eshop_attribute->format_type,
            'sort_order' => $validatedData['sort_order'] ?? $eshop_attribute->sort_order,
            'is_active' => $validatedData['is_active'],
        ]);

        if (isset($validatedData['translations']) && is_array($validatedData['translations'])) {
            $eshop_attribute->translates()->delete();
            foreach ($validatedData['translations'] as $translation) {
                if (isset($translation['locale']) && $translation['locale'] !== 'en') {
                    $eshop_attribute->translates()->create([
                        'locale' => $translation['locale'],
                        'name' => $translation['name'],
                    ]);
                }
            }
        }

        return redirect()->route('eshop-attributes.index')->with('success', 'Attribute updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Attribute $eshop_attribute)
    {
        $eshop_attribute->delete();
        return redirect()->route('eshop-attributes.index')->with('success', 'Attribute deleted successfully.');
    }
}
