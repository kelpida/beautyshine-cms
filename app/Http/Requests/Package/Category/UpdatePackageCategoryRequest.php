<?php

namespace App\Http\Requests\Package\Category;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePackageCategoryRequest extends FormRequest
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
        $categoryId = $this->route('category');
        
        return [
            'key' => [
                'required',
                'string',
                Rule::unique('package_categories', 'key')->ignore($categoryId),
            ],
            'translates' => 'required|array',
            'translates.*.locale' => 'required|string',
            'translates.*.name' => 'required|string|max:255',
        ];
    }
}
