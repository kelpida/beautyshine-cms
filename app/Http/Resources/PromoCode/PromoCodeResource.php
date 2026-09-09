<?php

namespace App\Http\Resources\PromoCode;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PromoCodeResource extends JsonResource
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
            'code' => $this->code,
            'discount_type' => $this->discount_type,
            'discount_value' => $this->discount_value,
            'is_active' => (bool) $this->is_active,
            'has_limitation' => (bool) $this->has_limitation,
            'used_count' => $this->used_count,
            'max_discount_amount' => $this->max_discount_amount ?? null,
            'min_order_amount' => $this->min_order_amount ?? null,
            'usage_limit' => $this->usage_limit ?? null,
            'start_date' => $this->start_date
                ? Carbon::parse($this->start_date)->format('Y-m-d')
                : null,

            'end_date' => $this->end_date
                ? Carbon::parse($this->end_date)->format('Y-m-d')
                : null,
        ];
    }
}
