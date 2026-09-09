<?php

namespace App\Http\Requests\Package\Attribute;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAttributeCategoryRequest extends FormRequest
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
        $attributeCategoryId = $this->route('attribute_category') 
            ? $this->route('attribute_category')->id 
            : $this->route('attributeCategory');
        
        return [
            'key' => [
                'required',
                'string',
                Rule::unique('attribute_categories', 'key')->ignore($attributeCategoryId),
            ],
            'translates' => 'required|array',
            'translates.*.locale' => 'required|string',
            'translates.*.name' => 'required|string|max:255',
        ];
    }
}
