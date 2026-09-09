<?php

namespace App\Http\Controllers;

use App\Http\Requests\Language\StoreLanguageRequest;
use App\Http\Requests\Language\UpdateLanguageRequest;
use App\Http\Resources\Language\LanguageResource;
use App\Models\Language;
use Inertia\Inertia;

class LanguageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $languages = LanguageResource::collection(Language::get()->sortBy('order_id'));
        return Inertia::render('Language/LanguageIndexPage', [
            'languages' => $languages
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Language/LanguageFormPage');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLanguageRequest $request)
    {
        $languageValidation = $request->validated();
        $languageValidation['order_id'] = Language::count() + 1;
        Language::create($languageValidation);
        return redirect()->route('languages.index')->with('success', 'Language created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $language = Language::find($id);
        return Inertia::render('Language/LanguageFormPage', [
            'language' => new LanguageResource($language)
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Language $language)
    {
        return Inertia::render('Language/LanguageFormPage', [
            'language' => new LanguageResource($language)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateLanguageRequest $request, Language $language)
    {
        $languageValidation = $request->validated();
        $language->update($languageValidation);
        return redirect()->route('languages.index')->with('success', 'Language updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Language $language)
    {
        $language->softDeleted();
        return redirect()->route('languages.index')->with('success', 'Language deleted successfully.');
    }
}
