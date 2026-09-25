<?php

namespace App\Http\Requests\Order;

use App\Enum\OrderSourceEnum;
use App\Enum\PaymentMethodEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
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
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $merge = [];

        // Support aliases 'pickup' -> 'pickup_details', 'delivery' -> 'delivery_details'
        $pickupData = $this->pickup_details ?? $this->pickup;
        $deliveryData = $this->delivery_details ?? $this->delivery;

        if ($pickupData && is_array($pickupData)) {
            if (!empty($pickupData['pickup_time']) && preg_match('/^\d{2}:\d{2}:\d{2}$/', $pickupData['pickup_time'])) {
                $pickupData['pickup_time'] = substr($pickupData['pickup_time'], 0, 5);
            }
            $merge['pickup_details'] = $pickupData;
        }

        if ($deliveryData && is_array($deliveryData)) {
            if (!empty($deliveryData['delivery_time']) && preg_match('/^\d{2}:\d{2}:\d{2}$/', $deliveryData['delivery_time'])) {
                $deliveryData['delivery_time'] = substr($deliveryData['delivery_time'], 0, 5);
            }
            $merge['delivery_details'] = $deliveryData;
        }

        // Auto-detect or default order_type
        if (!$this->has('order_type')) {
            if (!empty($deliveryData)) {
                $merge['order_type'] = 'delivery';
            } elseif (!empty($pickupData)) {
                $merge['order_type'] = 'pickup';
            } else {
                $merge['order_type'] = 'pickup';
            }
        }

        // Normalize items: support both product_id and item_id
        if ($this->has('items') && is_array($this->items)) {
            $items = collect($this->items)->map(function ($item) {
                if (!is_array($item)) {
                    return $item;
                }

                if (isset($item['item_id']) && !isset($item['product_id'])) {
                    $item['product_id'] = $item['item_id'];
                } elseif (isset($item['product_id']) && !isset($item['item_id'])) {
                    $item['item_id'] = $item['product_id'];
                }

                return $item;
            })->all();

            $merge['items'] = $items;
        }

        if (!empty($merge)) {
            $this->merge($merge);
        }
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
            'client.name' => ['nullable', 'string', 'max:255'],
            'client.surname' => ['nullable', 'string', 'max:255'],
            'client.email' => ['nullable', 'email', 'max:255'],
            'client.password' => [
                'nullable',
                'confirmed',
                Password::defaults(),
            ],
            'client.phone' => ['nullable', 'string', 'max:20'],
            'client.phone_code' => ['nullable', 'string', 'max:10'],
            'client.address' => ['nullable', 'string'],
            'client.client_type' => ['nullable', 'in:guest,registered'],

            'promo_code_id' => ['nullable', 'integer', 'exists:promo_codes,id'],

            'source' => ['nullable', new Enum(OrderSourceEnum::class)],
            'order_type' => ['nullable', 'string', Rule::in(['pickup', 'delivery'])],
            'payment_method' => ['nullable', 'string'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required_without:items.*.item_id', 'integer', 'exists:products,id'],
            'items.*.item_id' => ['nullable', 'integer', 'exists:products,id'],
            'items.*.variation_id' => ['nullable', 'integer', 'exists:product_variations,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['nullable', 'numeric', 'min:0'],

            // Item options (e.g. selected attribute options, addons)
            'items.*.options' => ['nullable', 'array'],
            'items.*.options.*.attribute_name' => ['nullable', 'string', 'max:255'],
            'items.*.options.*.option_name' => ['nullable', 'string', 'max:255'],
            'items.*.options.*.price_modifier' => ['nullable', 'numeric'],
            'items.*.options.*.option_id' => ['nullable', 'integer'],

            // Item custom fields
            'items.*.custom_fields' => ['nullable', 'array'],
            'items.*.custom_fields.*.field_name' => ['nullable', 'string', 'max:255'],
            'items.*.custom_fields.*.value' => ['nullable'],
            'pickup_details' => ['nullable', 'array'],
            'pickup_details.store_id' => ['nullable', 'integer', 'exists:stores,id'],
            'pickup_details.pickup_date' => ['nullable', 'date_format:Y-m-d'],
            'pickup_details.pickup_time' => ['nullable', 'date_format:H:i'],
            'pickup_details.note' => ['nullable', 'string'],

            // Delivery details
            'delivery_details' => ['nullable', 'array'],
            'delivery_details.delivery_address' => ['nullable', 'string', 'max:255'],
            'delivery_details.post_code' => ['nullable', 'string', 'max:20'],
            'delivery_details.city' => ['nullable', 'string', 'max:100'],
            'delivery_details.country' => ['nullable', 'string', 'max:100'],
            'delivery_details.delivery_date' => ['nullable', 'date_format:Y-m-d'],
            'delivery_details.delivery_time' => ['nullable', 'date_format:H:i'],
            'delivery_details.delivery_price' => ['nullable', 'numeric', 'min:0'],
            'delivery_details.note' => ['nullable', 'string'],

            // Legacy appointments
            'appointments' => ['nullable', 'array'],
            'appointments.store_id' => ['nullable', 'integer', 'exists:stores,id'],
            'appointments.date' => ['nullable', 'date_format:Y-m-d'],
            'appointments.start_time' => ['nullable', 'date_format:H:i'],
            'appointments.end_time' => ['nullable', 'date_format:H:i'],
            'appointments.duration' => ['nullable', 'integer'],
        ];
    }
}
