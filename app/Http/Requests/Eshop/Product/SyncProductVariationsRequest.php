<?php

namespace App\Http\Requests\Eshop\Product;

use Illuminate\Foundation\Http\FormRequest;

class SyncProductVariationsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'variations' => 'required|array|min:1',
            'variations.*.id' => 'nullable|integer',
            'variations.*.sku' => 'required|string|max:100',
            'variations.*.name' => 'required|string|max:255',
            'variations.*.short_description' => 'nullable|string',
            'variations.*.price' => 'required|numeric|min:0',
            'variations.*.sale_price' => 'nullable|numeric|min:0',
            'variations.*.quantity' => 'nullable|integer|min:0',
            'variations.*.is_available' => 'boolean',

            // Combinations of options that form this variation (e.g. Heart + Small)
            'variations.*.attribute_option_ids' => 'nullable|array',
            'variations.*.attribute_option_ids.*' => 'integer|exists:product_attribute_options,id',

            // Multi-language translations for each variation
            'variations.*.translations' => 'nullable|array',
            'variations.*.translations.*.locale' => ['required', 'string', 'max:10', 'exists:languages,code'],
            'variations.*.translations.*.name' => 'required|string|max:255',
            'variations.*.translations.*.short_description' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'variations.required' => 'At least one variation combination must be created.',
            'variations.*.sku.required' => 'SKU is required for each variation.',
            'variations.*.price.required' => 'Price is required for each variation.',
            'variations.*.name.required' => 'Name is required for each variation.',
        ];
    }
}
