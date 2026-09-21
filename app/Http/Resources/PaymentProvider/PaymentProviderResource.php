<?php

namespace App\Http\Resources\PaymentProvider;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentProviderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'status' => $this->status,
            'is_production' => (bool) $this->is_production,
            'logo_id' => $this->logo_id,
            'logo' => $this->logo ? [
                'id' => $this->logo->id,
                'name' => $this->logo->name,
                'path' => $this->logo->path,
                'url' => asset('storage/' . $this->logo->path),
            ] : null,

            // Credentials
            'merchant_id' => $this->merchant_id,
            'api_key' => $this->api_key,
            'client_id' => $this->client_id,
            'client_secret' => $this->client_secret,
            'source_code' => $this->source_code,
            'public_key' => $this->public_key,
            'secret_key' => $this->secret_key,
            'webhook_secret' => $this->webhook_secret,
            'acquirer_id' => $this->acquirer_id,
            'signature_key' => $this->signature_key,
            'credentials' => $this->credentials,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
