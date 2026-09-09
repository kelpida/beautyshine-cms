<?php

namespace App\Http\Controllers;

use App\Http\Requests\Post\PostCategoryRequest;
use App\Http\Resources\Post\PostCategoryResource;
use App\Http\Resources\UploadFile\UploadFileResource;
use App\Models\Language;
use App\Models\PostCategory;
use App\Models\UploadFile;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PostCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = PostCategoryResource::collection(PostCategory::with('seoMeta')->get());
        return Inertia::render('PostCategories/PostCategoryIndexPage', [
            'categories' => $categories
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = PostCategoryResource::collection(PostCategory::with('seoMeta')->get());

        $images = UploadFileResource::collection(
            UploadFile::where('type', 'image')->latest()->get()
        );

        return Inertia::render('PostCategories/PostCategoryFormPage', [
            'category' => null,
            'parents' => $categories ?? [],
            'images' => $images,
            'languages' => Language::where('is_active', true && 'deleted_at', null)->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PostCategoryRequest $request)
    {
        $validated = $request->validated();

        // Find English translation for default values
        $englishTranslation = collect($validated['translates'])
            ->firstWhere('locale', 'en');

        // Create the post category with English translation data
        $postCategory = PostCategory::create([
            'name' => $englishTranslation['name'],
            'path' => $validated['path'],
            'description' => $englishTranslation['description'],
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        // Save the SEO meta associated with this post
        $postCategory->seoMeta()->create([
            'meta_title' => $validated['meta_title'] ?? '',
            'meta_description' => $validated['meta_description'] ?? '',
            'image_id' => $validated['image_id'] ?? null,
        ]);

        // Save only non-English translations
        if (isset($validated['translates']) && is_array($validated['translates'])) {
            foreach ($validated['translates'] as $translate) {
                // Skip English since it's already in the main table
                if ($translate['locale'] === 'en') {
                    continue;
                }

                $postCategory->translates()->create([
                    'locale' => $translate['locale'],
                    'name' => $translate['name'],
                    'description' => $translate['description'],
                ]);
            }
        }

        return redirect()->route('post-categories.index')->with('success', 'Post category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $categoryData = PostCategory::with('children', 'parent', 'seoMeta', 'translates')->findOrFail($id);
        $category = new PostCategoryResource($categoryData);
        $categoriesData = PostCategory::with('seoMeta')->get();
        $categories = PostCategoryResource::collection($categoriesData);

        $images = UploadFileResource::collection(
            UploadFile::where('type', 'image')->latest()->get()
        );
        return Inertia::render('PostCategories/PostCategoryFormPage', [
            'category' => $category,
            'parents' => $categories ?? [],
            'images' => $images,
            'languages' => Language::where('is_active', true && 'deleted_at', null)->get(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $categoryData = PostCategory::with('children', 'parent', 'seoMeta', 'translates')->findOrFail($id);
        $category = new PostCategoryResource($categoryData);
        $categoriesData = PostCategory::with('seoMeta')->get();
        $categories = PostCategoryResource::collection($categoriesData);

        $images = UploadFileResource::collection(
            UploadFile::where('type', 'image')->latest()->get()
        );
        return Inertia::render('PostCategories/PostCategoryFormPage', [
            'category' => $category,
            'parents' => $categories ?? [],
            'images' => $images,
            'languages' => Language::where('is_active', true && 'deleted_at', null)->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PostCategoryRequest $request, string $id)
    {
        $validated = $request->validated();

        $postCategory = PostCategory::findOrFail($id);

        // Find English translation for default values
        $englishTranslation = collect($validated['translates'])
            ->firstWhere('locale', 'en');

        // Update the post category with English translation data
        $postCategory->update([
            'name' => $englishTranslation['name'],
            'path' => $validated['path'],
            'description' => $englishTranslation['description'],
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        // Handle translations (excluding English)
        if (isset($validated['translates']) && is_array($validated['translates'])) {

            // Extract all non-English locales sent in the update request
            $localesFromRequest = collect($validated['translates'])
                ->where('locale', '!=', 'en')
                ->pluck('locale')
                ->toArray();

            // 1. Delete translations that are NOT in the request
            $postCategory->translates()
                ->whereNotIn('locale', $localesFromRequest)
                ->delete();

            // 2. Update or create the translations that were sent (skip English)
            foreach ($validated['translates'] as $translate) {
                // Skip English since it's in the main table
                if ($translate['locale'] === 'en') {
                    continue;
                }

                $postCategory->translates()->updateOrCreate([
                    'locale' => $translate['locale'],
                ], [
                    'name' => $translate['name'],
                    'description' => $translate['description'],
                ]);
            }
        }

        // Update or create the SEO meta
        $postCategory->seoMeta()->updateOrCreate(
            ['metaable_id' => $postCategory->id, 'metaable_type' => PostCategory::class],
            [
                'meta_title' => $validated['meta_title'] ?? '',
                'meta_description' => $validated['meta_description'] ?? '',
                'image_id' => $validated['image_id'] ?? null,
            ]
        );

        return redirect()->route('post-categories.index')->with('success', 'Post category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $postCategory = PostCategory::findOrFail($id);
        $postCategory->delete();
        $postCategory->seoMeta()->delete();
        $postCategory->translates()->delete();

        return redirect()
            ->route('post-categories.index')
            ->with('success', 'Category deleted successfully.');
    }
}
