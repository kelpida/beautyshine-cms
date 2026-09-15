<?php

namespace App\Http\Requests\Eshop\Tags;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTagRequest extends FormRequest
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
            'slug' => 'required|string|max:255|unique:tags,slug,' . ($this->tag->id ?? $this->tag ?? $this->id),
            'sort_order' => 'nullable|integer',
            'is_active' => 'required|boolean',

            'translations' => 'nullable|array',
            'translations.*.locale' => ['required', 'string', 'max:10', 'distinct', 'exists:languages,code'],
            'translations.*.name' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'slug.required' => 'The :attribute field is required.',
            'slug.string' => 'The :attribute must be a string.',
            'slug.max' => 'The :attribute may not be greater than :max characters.',
            'slug.unique' => 'The :attribute has already been taken.',
            'sort_order.nullable' => 'The :attribute field must be an integer.',
            'is_active.required' => 'The :attribute field is required.',
            'is_active.boolean' => 'The :attribute field must be true or false.',
            'translations.nullable' => 'The :attribute field must be an array.',
            'translations.*.locale.required' => 'The translation language is required.',
            'translations.*.locale.exists' => 'The selected translation language does not exist.',
            'translations.*.locale.distinct' => 'Each translation must be for a unique language.',
            'translations.*.name.required' => 'The translated name is required.',
        ];
    }
}
