<?php

namespace App\Http\Resources\Package\Attributes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttributeOptionResource extends JsonResource
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
            'value' => $this->value,
            'label' => $this->label,
            'order_id' => $this->order_id,
            'translates' => $this->whenLoaded('optionTranslates'),
        ];
    }
}
