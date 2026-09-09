<?php

namespace App\Http\Resources\Package\Attributes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicAttributeCategoryResource extends JsonResource
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
            'translates' => $this->whenLoaded('translates', function () {
                return $this->translates->mapWithKeys(function ($translate) {
                    return [
                        $translate->locale => [
                            'name' => $translate->name,
                        ]
                    ];
                });
            }),
            'attributes' => $this->whenLoaded('attributes', function () {
                return PublicAttributeResource::collection($this->attributes);
            }),
        ];
    }
}
