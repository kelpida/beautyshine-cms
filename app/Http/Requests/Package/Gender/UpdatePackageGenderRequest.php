<?php

namespace App\Http\Requests\Package\Gender;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePackageGenderRequest extends FormRequest
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
        $genderId = $this->route('gender');
        
        return [
            'key' => [
                'required',
                'string',
                Rule::unique('package_genders', 'key')->ignore($genderId),
            ],
            'translates' => 'required|array',
            'translates.*.locale' => 'required|string',
            'translates.*.name' => 'required|string|max:255',
        ];
    }
}
