<?php

namespace App\Http\Requests\Eshop\Product;

use Illuminate\Foundation\Http\FormRequest;

class SyncProductAddonsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Selected add-on IDs (e.g. Cherries, Ribbons, Candles)
            'addon_ids' => 'nullable|array',
            'addon_ids.*' => 'integer|exists:product_addons,id',

            // Custom fields (optional information fields)
            'custom_fields' => 'nullable|array',
            'custom_fields.*.id' => 'nullable|integer',
            'custom_fields.*.field_name' => 'required|string|max:255',
            'custom_fields.*.field_type' => 'required|in:text,textarea,select,checkbox,date,file',
            'custom_fields.*.is_required' => 'boolean',
            'custom_fields.*.sort_order' => 'nullable|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'addon_ids.*.exists' => 'One or more selected add-ons do not exist.',
            'custom_fields.*.field_name.required' => 'Custom field name is required.',
        ];
    }
}
