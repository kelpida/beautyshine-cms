<?php

namespace App\Http\Controllers;

use App\Http\Requests\Package\Attribute\StoreAttributeRequest;
use App\Http\Requests\Package\Attribute\UpdateAttributeRequest;
use App\Http\Resources\Package\Attributes\AttributeCategoryResource;
use App\Models\Attribute;
use App\Http\Resources\Package\Attributes\AttributeResource;
use App\Models\AttributeCategory;
use App\Models\Language;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AttributeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $attribute = Attribute::where('deleted_at', null)->get();
        return Inertia::render('Package/Attributes/AttributesIndexPage', [
            'attributes' => AttributeResource::collection($attribute)
        ]);
    }

    public function publicIndex()
    {
        $attributes = Attribute::query()
            ->with(['translates', 'options.optionTranslates'])
            ->whereNull('deleted_at')
            ->whereHas('attributeCategory', function ($cat) {
                $cat->where('key', 'hidden-information');
            }, '=', 0)
            ->get();

        return AttributeResource::collection($attributes);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $attributeCategory = AttributeCategory::with('translates')->get();
        Log::info('Attribute Category:', ['data' => $attributeCategory]);
        return Inertia::render('Package/Attributes/AttributesFormPage', [
            'attribute' => new Attribute(),
            'languages' => Language::where('is_active', true && 'deleted_at', null)->get(),
            'attributeCategories' => AttributeCategoryResource::collection($attributeCategory),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAttributeRequest $request)
    {
        $attributeValidation = $request->validated();

        // Find the 'en' translation first
        $enTranslate = collect($attributeValidation['translates'])
            ->firstWhere('locale', 'en');

        if (!$enTranslate) {
            // Handle error if 'en' translation is required
            return redirect()->back()->withErrors(['translates' => 'English translation is required.']);
        }

        // Wrap creation in a DB transaction to ensure atomicity
        DB::transaction(function () use ($attributeValidation, $enTranslate) {
            // Create the main attribute with the 'en' translation
            $attribute = Attribute::create([
                'name' => $enTranslate['name'],
                'type' => $attributeValidation['type'],
                'format' => $attributeValidation['format'],
                'icon' => $attributeValidation['icon'],
                'is_featured' => $attributeValidation['is_featured'],
                'is_required' => $attributeValidation['is_required'],
                'attribute_category_id' => $attributeValidation['attribute_category_id'],
                'key' => $attributeValidation['key'],
            ]);

            if ($attributeValidation['type'] == 'select' || $attributeValidation['type'] == 'radio') {
                if (isset($attributeValidation['options'])) {
                    foreach ($attributeValidation['options'] as $option) {
                        $enOptionTranslate = collect($option['translates'])->firstWhere('locale', 'en');

                        if ($enOptionTranslate) {
                            $createdOption = $attribute->options()->create([
                                'value' => $enOptionTranslate['value'],
                                'label' => $enOptionTranslate['label'],
                            ]);

                            foreach ($option['translates'] as $translate) {
                                if ($translate['locale'] != 'en') {
                                    $createdOption->optionTranslates()->create([
                                        'label' => $translate['label'],
                                        'locale' => $translate['locale'],
                                    ]);
                                }
                            }
                        }
                    }
                }
            }

            // Now create the other translations
            foreach ($attributeValidation['translates'] as $translate) {
                if ($translate['locale'] != 'en') {
                    $attribute->translates()->create($translate);
                }
            }
        });

        return redirect()->route('attributes.index')->with('success', 'Attribute created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Attribute $attribute)
    {
        $attribute->load(['translates', 'options.optionTranslates', 'options']);
        return Inertia::render('Package/Attributes/AttributesFormPage', [
            'attribute' => new AttributeResource($attribute),
            'languages' => Language::where('is_active', true && 'deleted_at', null)->get(),
            'attributeCategories' => AttributeCategoryResource::collection(AttributeCategory::with('translates')->get())
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Attribute $attribute)
    {
        $attribute->load(['translates', 'options.optionTranslates']);
        return Inertia::render('Package/Attributes/AttributesFormPage', [
            'attribute' => $attribute,
            'languages' => Language::where('is_active', true && 'deleted_at', null)->get(),
            'attributeCategories' => AttributeCategoryResource::collection(AttributeCategory::with('translates')->get())
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAttributeRequest $request, Attribute $attribute)
    {
        $attributeValidation = $request->validated();

        // Find the 'en' translation first
        $enTranslate = collect($attributeValidation['translates'])
            ->firstWhere('locale', 'en');

        if (!$enTranslate) {
            return redirect()->back()->withErrors(['translates' => 'English translation is required.']);
        }

        DB::transaction(function () use ($attribute, $attributeValidation, $enTranslate) {
            // Update the main attribute
            $attribute->update([
                'name' => $enTranslate['name'],
                'type' => $attributeValidation['type'],
                'format' => $attributeValidation['format'],
                'icon' => $attributeValidation['icon'],
                'attribute_category_id' => $attributeValidation['attribute_category_id'],
                'key' => $attributeValidation['key'],
            ]);

            // Update attribute translations
            foreach ($attributeValidation['translates'] as $translate) {
                if ($translate['locale'] != 'en') {
                    $attribute->translates()->updateOrCreate(
                        ['locale' => $translate['locale']],
                        ['name' => $translate['name']]
                    );
                }
            }

            // Handle options if type is select or radio
            if ($attributeValidation['type'] == 'select' || $attributeValidation['type'] == 'radio') {
                $existingOptionIds = $attribute->options()->pluck('id')->toArray();
                $incomingOptionIds = [];

                if (isset($attributeValidation['options'])) {
                    foreach ($attributeValidation['options'] as $optionData) {
                        $enOptionTranslate = collect($optionData['translates'])->firstWhere('locale', 'en');
                        if (!$enOptionTranslate)
                            continue;

                        if (isset($optionData['id']) && in_array($optionData['id'], $existingOptionIds)) {
                            // Update existing option
                            $incomingOptionIds[] = $optionData['id'];
                            $option = $attribute->options()->find($optionData['id']);

                            $option->update([
                                'value' => $enOptionTranslate['value'],
                                'label' => $enOptionTranslate['label'],
                            ]);

                            // Update option translations
                            foreach ($optionData['translates'] as $translate) {
                                if ($translate['locale'] != 'en') {
                                    $option->optionTranslates()->updateOrCreate(
                                        ['locale' => $translate['locale']],
                                        ['label' => $translate['label']]
                                    );
                                }
                            }
                        } else {
                            // Create new option
                            $newOption = $attribute->options()->create([
                                'value' => $enOptionTranslate['value'],
                                'label' => $enOptionTranslate['label'],
                            ]);
                            $incomingOptionIds[] = $newOption->id;

                            foreach ($optionData['translates'] as $translate) {
                                if ($translate['locale'] != 'en') {
                                    $newOption->optionTranslates()->create([
                                        'label' => $translate['label'],
                                        'locale' => $translate['locale'],
                                    ]);
                                }
                            }
                        }
                    }
                }

                // Delete removed options
                $optionsToDelete = array_diff($existingOptionIds, $incomingOptionIds);
                if (!empty($optionsToDelete)) {
                    $attribute->options()->whereIn('id', $optionsToDelete)->delete();
                }
            } else {
                // If type changed to something else, delete all options
                $attribute->options()->delete();
            }
        });

        return redirect()->route('attributes.index')->with('success', 'Attribute updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Attribute $attribute)
    {
        $attribute->delete();
        return redirect()->route('attributes.index')->with('success', 'Attribute deleted successfully.');
    }
}
