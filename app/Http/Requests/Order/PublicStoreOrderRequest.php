<?php

namespace App\Http\Requests\Order;

use App\Enum\OrderSourceEnum;
use App\Enum\PaymentMethodEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

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
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $merge = [];

        // Support aliases 'pickup' -> 'pickup_details', 'delivery' -> 'delivery_details'
        $pickupData = $this->pickup_details ?? $this->pickup;
        $deliveryData = $this->delivery_details ?? $this->delivery;

        if ($pickupData && is_array($pickupData)) {
            // Trim seconds from pickup_time if passed as HH:mm:ss
            if (!empty($pickupData['pickup_time']) && preg_match('/^\d{2}:\d{2}:\d{2}$/', $pickupData['pickup_time'])) {
                $pickupData['pickup_time'] = substr($pickupData['pickup_time'], 0, 5);
            }
            $merge['pickup_details'] = $pickupData;
        }

        if ($deliveryData && is_array($deliveryData)) {
            // Trim seconds from delivery_time if passed as HH:mm:ss
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

        // Default source to online for public orders if not provided
        if (!$this->has('source')) {
            $merge['source'] = OrderSourceEnum::ONLINE->value;
        }

        // Normalize items: support both product_id and item_id, normalize custom fields & options
        if ($this->has('items') && is_array($this->items)) {
            $items = collect($this->items)->map(function ($item) {
                if (!is_array($item)) {
                    return $item;
                }

                // Map item_id to product_id and vice versa for backward compatibility
                if (isset($item['item_id']) && !isset($item['product_id'])) {
                    $item['product_id'] = $item['item_id'];
                } elseif (isset($item['product_id']) && !isset($item['item_id'])) {
                    $item['item_id'] = $item['product_id'];
                }

                // Normalize custom_fields: support associative array ['Field' => 'Value'] or list of items
                if (isset($item['custom_fields']) && is_array($item['custom_fields'])) {
                    $cfs = $item['custom_fields'];
                    $isAssoc = array_keys($cfs) !== range(0, count($cfs) - 1);
                    if ($isAssoc) {
                        $normalized = [];
                        foreach ($cfs as $key => $val) {
                            $normalized[] = [
                                'field_name' => (string) $key,
                                'value' => is_scalar($val) ? (string) $val : json_encode($val),
                            ];
                        }
                        $item['custom_fields'] = $normalized;
                    } else {
                        $item['custom_fields'] = array_map(function ($cf) {
                            if (is_array($cf) && !isset($cf['field_name']) && isset($cf['name'])) {
                                $cf['field_name'] = $cf['name'];
                            }
                            return $cf;
                        }, $cfs);
                    }
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
            // Client / Customer Information
            'client_id' => ['nullable', 'integer', 'exists:clients,id'],
            'client' => ['nullable', 'array'],
            'client.name' => ['nullable', 'string', 'max:255'],
            'client.surname' => ['nullable', 'string', 'max:255'],
            'client.email' => ['nullable', 'email', 'max:255'],
            'client.phone' => ['nullable', 'string', 'max:20'],
            'client.phone_code' => ['nullable', 'string', 'max:10'],
            'client.address' => ['nullable', 'string'],

            // Promo code
            'promo_code_id' => ['nullable', 'integer', 'exists:promo_codes,id'],
            'promo_code' => ['nullable', 'string', 'exists:promo_codes,code'],

            // Order metadata
            'source' => ['nullable', new Enum(OrderSourceEnum::class)],
            'order_type' => ['required', 'string', Rule::in(['pickup', 'delivery'])],
            'payment_method' => [
                'nullable',
                'string',
                Rule::in(['cash', 'card', 'bank_transfer', 'cash_on_delivery', 'apple_pay', 'google_pay']),
            ],

            // Items
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required_without:items.*.item_id', 'integer', 'exists:products,id'],
            'items.*.item_id' => ['nullable', 'integer', 'exists:products,id'],
            'items.*.variation_id' => ['nullable', 'integer', 'exists:product_variations,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['nullable', 'numeric', 'min:0'],

            // Item options
            'items.*.options' => ['nullable', 'array'],
            'items.*.options.*.attribute_name' => ['nullable', 'string', 'max:255'],
            'items.*.options.*.option_name' => ['nullable', 'string', 'max:255'],
            'items.*.options.*.price_modifier' => ['nullable', 'numeric'],
            'items.*.options.*.option_id' => ['nullable', 'integer', 'exists:product_attribute_options,id'],

            // Item custom fields
            'items.*.custom_fields' => ['nullable', 'array'],
            'items.*.custom_fields.*.field_name' => ['nullable', 'string', 'max:255'],
            'items.*.custom_fields.*.value' => ['nullable', 'string'],

            // Pickup details
            'pickup_details' => ['required_if:order_type,pickup', 'nullable', 'array'],
            'pickup_details.store_id' => ['nullable', 'integer', 'exists:stores,id'],
            'pickup_details.pickup_date' => ['required_if:order_type,pickup', 'nullable', 'date_format:Y-m-d'],
            'pickup_details.pickup_time' => ['required_if:order_type,pickup', 'nullable', 'date_format:H:i'],
            'pickup_details.note' => ['nullable', 'string'],

            // Delivery details
            'delivery_details' => ['required_if:order_type,delivery', 'nullable', 'array'],
            'delivery_details.delivery_address' => ['required_if:order_type,delivery', 'nullable', 'string', 'max:255'],
            'delivery_details.post_code' => ['nullable', 'string', 'max:20'],
            'delivery_details.city' => ['nullable', 'string', 'max:100'],
            'delivery_details.country' => ['nullable', 'string', 'max:100'],
            'delivery_details.delivery_date' => ['nullable', 'date_format:Y-m-d'],
            'delivery_details.delivery_time' => ['nullable', 'date_format:H:i'],
            'delivery_details.delivery_price' => ['nullable', 'numeric', 'min:0'],
            'delivery_details.note' => ['nullable', 'string'],

            // Appointments (Legacy / Optional)
            'appointments' => ['nullable', 'array'],
            'appointments.store_id' => ['nullable', 'integer', 'exists:stores,id'],
            'appointments.date' => ['nullable', 'date_format:Y-m-d'],
            'appointments.start_time' => ['nullable', 'date_format:H:i'],
            'appointments.end_time' => ['nullable', 'date_format:H:i'],
            'appointments.duration' => ['nullable', 'integer'],
        ];
    }
}
