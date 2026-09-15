<?php

namespace App\Http\Requests\Eshop\Product;

use Illuminate\Foundation\Http\FormRequest;

class SyncProductAttributesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'attributes' => 'required|array',
            'attributes.*.attribute_id' => 'required|integer|exists:attributes,id',
            'attributes.*.is_required' => 'boolean',
            'attributes.*.sort_order' => 'nullable|integer',

            // Options under each attribute (e.g. Heart, Round, Square)
            'attributes.*.options' => 'nullable|array',
            'attributes.*.options.*.name' => 'required|string|max:255',
            'attributes.*.options.*.extra_price' => 'nullable|numeric|min:0',
            'attributes.*.options.*.is_available' => 'boolean',
            'attributes.*.options.*.sort_order' => 'nullable|integer',

            // Option translations (e.g. EL, FR)
            'attributes.*.options.*.translations' => 'nullable|array',
            'attributes.*.options.*.translations.*.locale' => ['required', 'string', 'max:10', 'exists:languages,code'],
            'attributes.*.options.*.translations.*.name' => 'required|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'attributes.required' => 'At least one attribute must be provided.',
            'attributes.*.attribute_id.exists' => 'Selected attribute does not exist.',
            'attributes.*.options.*.name.required' => 'Option name is required.',
            'attributes.*.options.*.translations.*.name.required' => 'Option translated name is required.',
        ];
    }
}
