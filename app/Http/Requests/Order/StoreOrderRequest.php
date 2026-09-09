<?php

namespace App\Http\Requests\Order;

use App\Enum\OrderSourceEnum;
use App\Enum\PaymentMethodEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Rules\Password;

class StoreOrderRequest extends FormRequest
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
            'client.name' => ['nullable', 'string'],
            'client.surname' => ['nullable', 'string'],
            'client.email' => ['nullable', 'email', 'unique:clients,email'],

            'client.password' => [
                'nullable',
                'confirmed',
                Password::defaults(),
            ],

            'client.phone' => ['nullable', 'regex:/^[0-9]+$/', 'min:7', 'max:20', 'unique:clients,phone'],
            'client.phone_code' => ['nullable', 'string', 'max:5'],

            'client.address' => ['nullable', 'string'],

            'promo_code_id' => ['nullable', 'integer', 'exists:promo_codes,id'],

            'source' => ['nullable', new Enum(OrderSourceEnum::class)],
            'payment_method' => ['nullable', new Enum(PaymentMethodEnum::class)],

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
