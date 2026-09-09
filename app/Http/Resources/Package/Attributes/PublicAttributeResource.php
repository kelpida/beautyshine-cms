<?php

namespace App\Http\Resources\Package\Attributes;

use App\Http\Resources\UploadFile\ImageResource;
use App\Http\Resources\UploadFile\UploadFileResource;
use App\Models\UploadFile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicAttributeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "name" => $this->name,
            "type" => $this->type,
            "format" => $this->format,
            "key" => $this->key,
            "icon" => $this->icon,
            "is_featured" => (bool) $this->is_featured,
            'translates' => $this->whenLoaded('translates', function () {
                return $this->translates->mapWithKeys(function ($translate) {
                    return [
                        $translate->locale => [
                            'name' => $translate->name,
                        ]
                    ];
                });
            }),
            'options' => $this->whenLoaded('options', function () {
                return PublicAttributeOptionResource::collection($this->options);
            }),
            'value' => $this->formatValue($this->pivot->value ?? $this->value),
        ];
    }

    protected function formatValue($value)
    {
        switch ($this->format) {
            case 'boolean':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            case 'file':
            case 'image':
                $file = UploadFile::find($value);
                return $file ? new ImageResource($file) : null;
            default:
                return (string) $value;
        }
    }
}
