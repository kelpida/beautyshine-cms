<?php

namespace App\Http\Resources\Package\Attributes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttributeResource extends JsonResource
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
            'type' => $this->type,
            'format' => $this->format,
            'icon' => $this->icon,
            'order_id' => $this->order_id,
            'is_featured' => (bool) $this->is_featured,
            'is_required' => (bool) $this->is_required,
            'attribute_category_id' => $this->attribute_category_id,
            'options' => AttributeOptionResource::collection($this->whenLoaded('options')),
            'translates' => $this->whenLoaded('translates'),
        ];
    }
}
