<?php

namespace App\Http\Resources\Page;

use App\Http\Resources\Seo\SeoResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PageResource extends JsonResource
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
            'title' => $this->title,
            'page_name' => $this->page_name,
            'path' => $this->path,
            'seo_meta' => new SeoResource($this->seoMeta),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
