<?php

namespace App\Http\Requests\Package\Attribute;

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
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $attributeId = $this->route('attribute') 
            ? $this->route('attribute')->id 
            : $this->route('attribute');
        
        return [
            'key' => [
                'required',
                'string',
                Rule::unique('attributes', 'key')->ignore($attributeId),
            ],
            'type' => 'required|string',
            'format' => 'nullable|string',
            'icon' => 'nullable|string',
            'is_featured' => 'boolean',
            'is_required' => 'boolean',
            'attribute_category_id' => 'required|exists:attribute_categories,id',
            'translates' => 'required|array',
            'translates.*.locale' => 'required|string',
            'translates.*.name' => 'required|string|max:255',
            'options' => 'nullable|array',
            'options.*.value' => 'nullable|string',
            'options.*.label' => 'nullable|string',
            'options.*.translates' => 'nullable|array',
            'options.*.translates.*.locale' => 'nullable|string',
            'options.*.translates.*.label' => 'nullable|string',
        ];
    }
}
