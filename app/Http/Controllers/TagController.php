<?php

namespace App\Http\Controllers;

use App\Models\Eshop\Tag;
use App\Http\Requests\Eshop\Tags\StoreTagRequest;
use App\Http\Requests\Eshop\Tags\UpdateTagRequest;
use App\Models\Language;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TagController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return Inertia::render('Eshop/Tag/IndexEshopTagsPage', [
            'eshopTags' => Tag::query()
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
        return Inertia::render('Eshop/Tag/FormEshopTagsPage', [
            'languages' => $languages,
            'eshopTag' => null,
            'nextSortOrder' => Tag::nextSortOrder(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTagRequest $request)
    {
        $validatedData = $request->validated();

        $tag = Tag::create([
            'name' => $validatedData['name'] ?? null,
            'slug' => $validatedData['slug'],
            'sort_order' => $validatedData['sort_order'] ?? Tag::nextSortOrder(),
            'is_active' => $validatedData['is_active'],
        ]);

        if (!empty($validatedData['translations']) && is_array($validatedData['translations'])) {
            foreach ($validatedData['translations'] as $translation) {
                if (isset($translation['locale']) && $translation['locale'] !== 'en') {
                    $tag->translates()->create([
                        'locale' => $translation['locale'],
                        'name' => $translation['name'],
                    ]);
                }
            }
        }

        return redirect()->route('eshop-tags.index')->with('success', 'Tag created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Tag $tag)
    {
        return $this->edit($tag);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tag $tag)
    {
        $languages = Language::active()->get();
        return Inertia::render('Eshop/Tag/FormEshopTagsPage', [
            'languages' => $languages,
            'eshopTag' => $tag->load('translates'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTagRequest $request, Tag $tag)
    {
        $validatedData = $request->validated();

        $tag->update([
            'name' => $validatedData['name'] ?? $tag->name,
            'slug' => $validatedData['slug'],
            'sort_order' => $validatedData['sort_order'] ?? $tag->sort_order,
            'is_active' => $validatedData['is_active'],
        ]);

        if (isset($validatedData['translations']) && is_array($validatedData['translations'])) {
            $tag->translates()->delete();
            foreach ($validatedData['translations'] as $translation) {
                if (isset($translation['locale']) && $translation['locale'] !== 'en') {
                    $tag->translates()->create([
                        'locale' => $translation['locale'],
                        'name' => $translation['name'],
                    ]);
                }
            }
        }

        return redirect()->route('eshop-tags.index')->with('success', 'Tag updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tag $tag)
    {
        $tag->delete();
        return redirect()->route('eshop-tags.index')->with('success', 'Tag deleted successfully.');
    }
}
