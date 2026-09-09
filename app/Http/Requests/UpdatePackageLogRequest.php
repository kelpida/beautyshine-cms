<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePackageLogRequest extends FormRequest
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
            'visitor_id' => 'sometimes|required|string',
            'client_id' => 'nullable|exists:clients,id',
            'package_id' => 'sometimes|required|exists:packages,id',
            'event_type' => 'sometimes|required|in:view,wishlist,share',
        ];
    }
}
