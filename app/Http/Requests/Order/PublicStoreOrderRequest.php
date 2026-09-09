<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class PublicStoreOrderRequest extends FormRequest
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
            'client_id' => ['nullable', 'integer', 'exists:clients,id'],

            'promo_code_id' => ['nullable', 'integer', 'exists:promo_codes,id'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.item_id' => ['required', 'integer', 'distinct', 'exists:packages,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],

            'appointments.store_id' => ['required', 'integer', 'exists:stores,id'],
            'appointments.date' => ['required', 'date_format:Y-m-d'],
            'appointments.start_time' => ['required', 'date_format:H:i'],
            'appointments.end_time' => ['required', 'date_format:H:i'],
            'appointments.duration' => ['required', 'integer'],
        ];
    }
}
