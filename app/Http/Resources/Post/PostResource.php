<?php

namespace App\Http\Resources\Post;

use App\Http\Resources\UploadFile\UploadFileResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'title' => $this->title,
            'path' => $this->path,
            'content' => $this->content,
            'author_id' => $this->author_id,
            'image'     => $this->whenLoaded('image', fn() => new UploadFileResource($this->image)),
            'categories'  => $this->whenLoaded('categories', fn() => SinglePostCategoryResource::collection($this->categories)),

            'seo_meta' => $this->whenLoaded('seoMeta', function () {
                $seo = $this->seoMeta;

                return [
                    'meta_title' => optional($seo)->meta_title,
                    'meta_description' => optional($seo)->meta_description,
                    'meta_image'       => $seo && $seo->image
                        ? new UploadFileResource($seo->image)
                        : ($this->relationLoaded('image') && $this->image
                            ? new UploadFileResource($this->image)
                            : null),

                ];
            }),
        ];
    }
}
