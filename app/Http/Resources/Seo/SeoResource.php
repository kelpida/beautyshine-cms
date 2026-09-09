<?php

namespace App\Http\Resources\Seo;

use App\Http\Resources\UploadFile\ImageResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SeoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'title' => $this->meta_title,
            'description' => $this->meta_description,
            'image' => $this->image ? new ImageResource($this->image) : null,
        ];
    }
}
