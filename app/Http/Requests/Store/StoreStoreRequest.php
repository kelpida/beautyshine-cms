<?php

namespace App\Http\Requests\Store;

use Illuminate\Foundation\Http\FormRequest;

class StoreStoreRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],

            'slug' => [
                'required',
                'string',
                'max:255',
                'alpha_dash',
                'unique:stores,slug'
            ],

            'description' => ['nullable', 'string'],

            'map_url' => ['nullable', 'string'],

            'address' => ['nullable', 'string'],

            'phone' => ['nullable', 'string', 'max:50'],

            'phone_code' => ['nullable', 'string', 'max:10'],

            'email' => ['nullable', 'email', 'max:255'],

            'is_active' => ['nullable', 'boolean'],

            'translations' => ['nullable', 'array'],
            'translations.*.locale' => ['required', 'string', 'max:10'],
            'translations.*.name' => ['nullable', 'string', 'max:255'],
            'translations.*.address' => ['nullable', 'string'],
        ];
    }
}
