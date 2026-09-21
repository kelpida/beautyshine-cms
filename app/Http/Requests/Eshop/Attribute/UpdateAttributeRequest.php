<?php

namespace App\Http\Requests\Eshop\Attribute;

use Illuminate\Foundation\Http\FormRequest;

use Illuminate\Validation\Rule;

class UpdateAttributeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if (is_array($this->translations)) {
            $enTranslation = collect($this->translations)->firstWhere('locale', 'en');
            if ((empty($this->name) || trim($this->name) === '') && !empty($enTranslation['name'])) {
                $this->merge(['name' => trim($enTranslation['name'])]);
            }

            $this->merge([
                'translations' => array_values(array_filter($this->translations, function ($item) {
                    return !empty(trim($item['name'] ?? '')) && ($item['locale'] ?? '') !== 'en';
                })),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $attribute = $this->route('eshop_attribute') ?? $this->route('attribute') ?? $this->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('attributes', 'slug')->ignore($attribute),
            ],
            'format_type' => [
                'required',
                'in:select,radio,text,number,range,checkbox,color,date,time,datetime,file,image,textarea,select_multiple,radio_multiple,range_multiple,checkbox_multiple,color_multiple,date_multiple,time_multiple,datetime_multiple',
            ],
            'is_active' => ['required', 'boolean'],
            'sort_order' => ['nullable', 'integer'],

            'translations' => ['nullable', 'array'],
            'translations.*.locale' => ['required', 'string', 'max:10', 'distinct', 'exists:languages,code'],
            'translations.*.name' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The :attribute field is required.',
            'name.string' => 'The :attribute must be a string.',
            'name.max' => 'The :attribute may not be greater than :max characters.',
            'is_active.required' => 'The :attribute field is required.',
            'is_active.boolean' => 'The :attribute field must be true or false.',
            'sort_order.nullable' => 'The :attribute field must be an integer.',
            'translations.*.locale.required' => 'The translation language is required.',
            'translations.*.locale.exists' => 'The selected translation language does not exist.',
            'translations.*.locale.distinct' => 'Each translation must be for a unique language.',
            'translations.*.name.required' => 'The translated name is required.',
        ];
    }
}
