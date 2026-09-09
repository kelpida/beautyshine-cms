<?php

namespace App\Http\Resources\UploadFile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ImageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "alt" => $this->name,
            "url" => asset('storage/' . $this->path),
            "type" => $this->mime_type,
        ];
    }
}
