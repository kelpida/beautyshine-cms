<?php

namespace App\Http\Requests\Package;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePackageRequest extends FormRequest
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
        $this->merge([
            'preparation' => is_array($this->preparation) ? $this->preparation : [],
            'tests' => is_array($this->tests) ? $this->tests : [],
            'faq' => is_array($this->faq) ? $this->faq : [],
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'path' => 'required|string|max:255',
            'number' => 'nullable|string|max:50',
            'subtitle' => 'nullable|string|max:255',
            'price' => 'required|numeric',
            'duration' =>  'required|numeric',

            'purpose' => 'nullable|string',
            'preparation' => 'nullable|array',
            'tests' => 'nullable|array',
            'faq' => 'nullable|array',
            'main_image_id' => 'nullable|exists:upload_files,id',
            'is_featured' => 'nullable|boolean',
            'package_category_ids' => 'nullable|array',
            'package_category_ids.*' => 'nullable|exists:package_categories,id',
            'package_gender_id' => 'nullable|exists:package_genders,id',
            'package_age_id' => 'nullable|exists:package_ages,id',
            'package_status_id' => 'nullable|exists:package_statuses,id',
            'test_category_ids' => 'nullable|array',
            'test_category_ids.*' => 'exists:attribute_categories,id',
            'gallery' => 'nullable|array',
            'gallery.*' => 'nullable|exists:upload_files,id',
            'attributes' => 'nullable|array',
            'attributes.*' => [
                'nullable',
                function ($attribute, $value, $fail) {
                    if (is_array($value)) {
                        if (!isset($value['id'])) {
                            $fail("The {$attribute} must have an id if it is a file array.");
                        }
                    } elseif (!is_scalar($value) && !is_null($value)) {
                        $fail("The {$attribute} must be a string, number, or file object.");
                    }
                }
            ],
            'translates' => 'nullable|array',
            'translates.*' => 'nullable|array',
            'translates.*.locale' => 'nullable|string',
            'translates.*.name' => 'nullable|string|max:255',
            'translates.*.description' => 'nullable|string',

            'capacities' => ['nullable', 'array'],
            'capacities.*.store_id' => [
                'required',
                'exists:stores,id',
                'distinct',
            ],
            'capacities.*.max_bookings' => [
                'required',
                'integer',
                'min:1',
            ],
        ];
    }
}
