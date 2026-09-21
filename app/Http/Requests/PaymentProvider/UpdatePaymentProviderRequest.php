<?php

namespace App\Http\Requests\PaymentProvider;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePaymentProviderRequest extends FormRequest
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
            'code' => [
                'required',
                'string',
                'in:viva,stripe,jcc,revolut',
                \Illuminate\Validation\Rule::unique('payment_providers', 'code')->ignore($this->route('payment_provider')?->id ?? $this->payment_provider?->id),
            ],
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:65535',
            'status' => 'required|in:active,inactive',
            'logo_id' => 'nullable|exists:upload_files,id',
            'is_production' => 'required|boolean',
            // Viva Wallet
            'merchant_id' => 'nullable|string|max:255',
            'api_key' => 'nullable|string|max:255',
            'client_id' => 'nullable|string|max:255',
            'client_secret' => 'nullable|string|max:255',
            'source_code' => 'nullable|string|max:255',
            // Stripe / Revolut
            'public_key' => 'nullable|string|max:255',
            'secret_key' => 'nullable|string|max:65535',
            'webhook_secret' => 'nullable|string|max:65535',
            // JCC
            'acquirer_id' => 'nullable|string|max:255',
            'signature_key' => 'nullable|string|max:65535',
            // Extra credentials (optional)
            'credentials' => 'nullable|array',
        ];
    }
}
