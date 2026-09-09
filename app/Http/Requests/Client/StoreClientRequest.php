<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreClientRequest extends FormRequest
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
            'name' => ['required', 'string'],
            'surname' => ['required', 'string'],
            'email' => ['required', 'email', 'unique:clients,email'],

            'password' => ['required', Password::defaults()],

            'phone' => ['required', 'regex:/^[0-9]+$/', 'min:7', 'max:20'],
            'phone_code' => ['required', 'string', 'max:5'],

            'address' => ['required', 'string'],
        ];
    }
}
