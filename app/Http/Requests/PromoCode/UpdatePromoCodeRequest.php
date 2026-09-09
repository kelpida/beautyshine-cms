<?php

namespace App\Http\Requests\PromoCode;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePromoCodeRequest extends FormRequest
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
            'code' => "required|unique:promo_codes,code," . $this->promo_code->id,
            'discount_type' => "nullable|in:percent,amount",
            'discount_value' => 'nullable|numeric|min:0',
            'is_active' => "nullable|boolean",
            'has_limitation' => "nullable|boolean",
            // 'used_count' => "required", => by default on create is 0
            'max_discount_amount' => "nullable|numeric|min:0",
            'min_order_amount' => "nullable|numeric|min:0",
            'usage_limit' => "nullable|integer|min:1",
            'special_user' => "nullable|string",
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ];
    }
}
