<?php

namespace App\Http\Resources\Package\Attributes;

use App\Http\Resources\UploadFile\UploadFileResource;
use App\Models\UploadFile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PackageAttributeResource extends JsonResource
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
            'value' => $this->formatValue($this->pivot->value ?? $this->value),
        ];
    }

    protected function formatValue($value)
    {
        if (in_array($this->format, ['image', 'file'])) {
            $file = UploadFile::find($value);
            return $file ? new UploadFileResource($file) : null;
        }
        if ($this->format === 'boolean' || $this->type === 'checkbox') {
            return filter_var($value, FILTER_VALIDATE_BOOLEAN);
        }
        return $value;
    }
}
