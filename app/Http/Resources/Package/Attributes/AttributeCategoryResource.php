<?php

namespace App\Http\Resources\Package\Attributes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttributeCategoryResource extends JsonResource
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
            'key' => $this->key,
            'order_id' => $this->order_id,
            'attributes' => AttributeResource::collection($this->whenLoaded('attributes')),
            'translates' => $this->whenLoaded('translates'),
        ];
    }
}
