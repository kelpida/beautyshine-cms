<?php

namespace App\Http\Controllers;

use App\Http\Requests\BlockContent\StoreBlockContentRequest;
use App\Http\Requests\BlockContent\UpdateBlockContentRequest;
use App\Http\Resources\BlockContent\BlockContentResource;
use App\Http\Resources\UploadFile\UploadFileResource;
use App\Models\BlockContent;
use App\Models\Language;
use App\Models\Page;
use App\Models\UploadFile;
use Inertia\Inertia;

class BlockContentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $blockContents = BlockContent::with('page')->latest()->get();

        return Inertia::render('BlockContent/BlockContentIndexPage', [
            'blockContents' => BlockContentResource::collection($blockContents)
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $pages = Page::all();
        $languages = Language::where('is_active', true && 'deleted_at', null)->get();
        $images = UploadFileResource::collection(
            UploadFile::where('type', 'image')->latest()->get()
        );

        return Inertia::render('BlockContent/BlockContentFormPage', [
            'pages' => $pages,
            'languages' => $languages,
            'imagesData' => $images
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBlockContentRequest $request)
    {
        $validated = $request->validated();

        BlockContent::create($validated);

        return redirect()->route('block-contents.index')
            ->with('success', 'Block content created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(BlockContent $blockContent)
    {
        return new BlockContentResource($blockContent->load('page'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(BlockContent $blockContent)
    {
        $pages = Page::all();
        $languages = Language::where('is_active', true && 'deleted_at', null)->get();
        $images = UploadFileResource::collection(
            UploadFile::where('type', 'image')->latest()->get()
        );

        return Inertia::render('BlockContent/BlockContentFormPage', [
            'blockContent' => new BlockContentResource($blockContent->load('page')),
            'pages' => $pages,
            'languages' => $languages,
            'imagesData' => $images
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBlockContentRequest $request, BlockContent $blockContent)
    {
        $validated = $request->validated();

        $blockContent->update($validated);

        return redirect()->route('block-contents.index')
            ->with('success', 'Block content updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BlockContent $blockContent)
    {
        $blockContent->delete();

        return redirect()->route('block-contents.index')
            ->with('success', 'Block content deleted successfully');
    }
}
