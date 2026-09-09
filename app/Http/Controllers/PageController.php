<?php

namespace App\Http\Controllers;

use App\Http\Requests\Page\PageRequest;
use App\Http\Resources\Page\PageResource;
use App\Http\Resources\Page\PublicPageResource;
use App\Http\Resources\UploadFile\UploadFileResource;
use App\Models\Page;
use App\Models\SeoMeta;
use App\Models\UploadFile;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //    $languages = LanguageResource::collection(Language::get());
        return Inertia::render('Page/PageIndexPage', [
            'pages' => PageResource::collection(Page::all())
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $images = UploadFileResource::collection(
            UploadFile::where('type', 'image')->latest()->get()
        );
        return Inertia::render('Page/PageFormPage', [
            'imagesData' => $images
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PageRequest $request)
    {
        $pageValidation = $request->validated();
        $page = Page::create([
            'title' => $pageValidation['title'],
            'path' => $pageValidation['path'],
            'page_name' => $pageValidation['page_name'],
        ]);

        SeoMeta::create([
            'meta_title' => $pageValidation['meta_title'],
            'meta_description' => $pageValidation['meta_description'],
            'image_id' => $pageValidation['meta_image_id'],
            'metaable_id' => $page->id,
            'metaable_type' => Page::class,
        ]);

        return redirect()->route('pages.index')->with('success', 'Page created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $page = Page::with('seoMeta')->findOrFail($id);

        $images = UploadFileResource::collection(
            UploadFile::where('type', 'image')->latest()->get()
        );
        return Inertia::render('Page/PageFormPage', [
            'page' => new PageResource($page),
            'imagesData' => $images
        ]);
    }
    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {

        $page = Page::with('seoMeta.metaImage')->findOrFail($id);
        $images = UploadFileResource::collection(
            UploadFile::where('type', 'image')->latest()->get()
        );
        return Inertia::render('Page/PageFormPage', [
            'page' => new PageResource($page),
            'imagesData' => $images
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PageRequest $request, string $id)
    {
        $pageValidation = $request->validated();
        $page = Page::findOrFail($id);

        $page->update([
            'title' => $pageValidation['title'],
            'path' => $pageValidation['path'],
            'page_name' => $pageValidation['page_name'],
        ]);

        $page->seoMeta()->updateOrCreate(
            ['metaable_id' => $page->id, 'metaable_type' => Page::class],
            [
                'meta_title' => $pageValidation['meta_title'],
                'meta_description' => $pageValidation['meta_description'],
                'image_id' => $pageValidation['meta_image_id'],
            ]
        );

        return redirect()->route('pages.index')->with('success', 'Page updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $page = Page::findOrFail($id);
        $page->delete();
        return redirect()->route('pages.index')->with('success', 'Page deleted successfully');
    }

    /**
     * Public API endpoint to get all pages with their block contents
     * Returns pages keyed by page_name
     */
    public function publicIndex()
    {
        $pages = Page::with('blockContents')->get();

        // Transform to use page_name as key
        $transformedPages = $pages->mapWithKeys(function ($page) {
            return [$page->page_name => new PublicPageResource($page)];
        });

        return response()->json($transformedPages);
    }
}
