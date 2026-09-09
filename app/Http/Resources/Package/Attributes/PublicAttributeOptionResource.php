<?php

namespace App\Http\Resources\Package\Attributes;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicAttributeOptionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'value' => $this->value,
            'label' => $this->label,
            'translates' => $this->whenLoaded('optionTranslates', function () {
                return $this->optionTranslates->mapWithKeys(function ($translate) {
                    return [
                        $translate->locale => [
                            'label' => $translate->label,
                        ]
                    ];
                });
            }),
        ];
    }
}
