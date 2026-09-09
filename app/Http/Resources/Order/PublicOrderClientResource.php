<?php

namespace App\Http\Resources\Order;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicOrderClientResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $transaction = $this->transactions->last();

        return [
            'id' => $this->id,
            'items' => $this->items,
            'order_status' => $this->status,
            'payment_status' => $transaction?->status,
            'total_amount' => $this->total_amount,
            'discount_amount' => $this->discount_amount,
            'amount' => $this->amount,
            'promo_code' => $this->promoCode,
        ];;
    }
}
