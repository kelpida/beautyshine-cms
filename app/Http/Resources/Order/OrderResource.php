<?php

namespace App\Http\Resources\Order;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
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
            'client_name' => $this->client ? trim($this->client->name . ' ' . $this->client->surname) : null,
            'client_email' => $this->client?->email,
            'items' => $this->items,
            'transaction_id' => $transaction?->transaction_id,
            'order_status' => $this->status,
            'payment_status' => $transaction?->status,
            'total_amount' => $this->total_amount,
            'source' => $this->source ?? null,
            'payment_method' => $this->payment_method ?? null,
            'discount_amount' => $this->discount_amount,
            'amount' => $this->amount,
            'appointment' => $this->appointments ? [
                'date' => $this->appointments->date,
                'store' => [
                    'id' => $this->appointments->store?->id,
                    'name' => $this->appointments->store?->name,
                ],
                'start_time' => substr($this->appointments->start_time, 0, 5),
                'end_time' => substr($this->appointments->end_time, 0, 5),
            ] : null,
            'promo_code' => $this->promoCode,
            'is_seen' => (bool) $this->is_seen,
            'created_at' => $this->created_at,
        ];
    }
}
