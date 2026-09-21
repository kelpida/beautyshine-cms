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
            'order_type' => $this->order_type ?? null,
            'payment_method' => $this->payment_method ?? null,
            'discount_amount' => $this->discount_amount,
            'amount' => $this->amount,
            'pickup_details' => $this->pickupDetails ? [
                'pickup_date' => $this->pickupDetails->pickup_date,
                'pickup_time' => substr($this->pickupDetails->pickup_time, 0, 5),
                'note' => $this->pickupDetails->note,
                'store' => $this->pickupDetails->store ? [
                    'id' => $this->pickupDetails->store->id,
                    'name' => $this->pickupDetails->store->name,
                ] : null,
            ] : null,
            'delivery_details' => $this->deliveryDetails ? [
                'delivery_address' => $this->deliveryDetails->delivery_address,
                'post_code' => $this->deliveryDetails->post_code,
                'city' => $this->deliveryDetails->city,
                'country' => $this->deliveryDetails->country,
                'delivery_date' => $this->deliveryDetails->delivery_date,
                'delivery_time' => $this->deliveryDetails->delivery_time ? substr($this->deliveryDetails->delivery_time, 0, 5) : null,
                'delivery_price' => $this->deliveryDetails->delivery_price,
                'note' => $this->deliveryDetails->note,
            ] : null,
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
