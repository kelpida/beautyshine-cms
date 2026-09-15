<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEshopCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:eshop_categories,slug',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'required|boolean',
            'parent_id' => 'nullable|exists:eshop_categories,id',
            'image_id' => 'nullable|exists:upload_files,id',

            'translations' => 'nullable|array',
            'translations.*.locale' => ['required', 'string', 'max:10', 'distinct', 'exists:languages,code'],
            'translations.*.name' => ['required', 'string', 'max:255'],
            'translations.*.description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The :attribute field is required.',
            'name.string' => 'The :attribute must be a string.',
            'name.max' => 'The :attribute may not be greater than :max characters.',
            'slug.required' => 'The :attribute field is required.',
            'slug.string' => 'The :attribute must be a string.',
            'slug.max' => 'The :attribute may not be greater than :max characters.',
            'slug.unique' => 'The :attribute has already been taken.',
            'description.nullable' => 'The :attribute field must be a string.',
            'sort_order.nullable' => 'The :attribute field must be an integer.',
            'is_active.required' => 'The :attribute field is required.',
            'is_active.boolean' => 'The :attribute field must be true or false.',
            'parent_id.nullable' => 'The :attribute field must be an integer.',
            'parent_id.exists' => 'The selected :attribute is invalid.',
            'image_id.nullable' => 'The :attribute field must be an integer.',
            'image_id.exists' => 'The selected :attribute is invalid.',
            'translations.nullable' => 'The :attribute field must be an array.',
            'translations.*.locale.required' => 'The translation language is required.',
            'translations.*.locale.exists' => 'The selected translation language does not exist.',
            'translations.*.locale.distinct' => 'Each translation must be for a unique language.',
            'translations.*.name.required' => 'The translated name is required.',
        ];
    }
}
