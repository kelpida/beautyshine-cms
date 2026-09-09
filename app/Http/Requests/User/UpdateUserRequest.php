<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
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
            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($this->route('user')),
            ],
            // 'password' => 'nullable|string|min:8|confirmed',
            'password' => 'nullable|string|min:8',

            'role_id' => 'required|exists:roles,id',

            'scope' => 'nullable|array',
            'scope.*.resource_type' => 'required_with:scope|string',
            'scope.*.resource_id' => 'nullable|integer',
            'scope.*.mode' => 'required_with:scope|in:allow,deny',
        ];
    }
}
