<?php

namespace App\Http\Requests\Package\Age;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePackageAgeRequest extends FormRequest
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
        $ageId = $this->route('age');
        
        return [
            'key' => [
                'required',
                'string',
                Rule::unique('package_ages', 'key')->ignore($ageId),
            ],
            'translates' => 'required|array',
            'translates.*.locale' => 'required|string',
            'translates.*.name' => 'required|string|max:255',
        ];
    }
}
