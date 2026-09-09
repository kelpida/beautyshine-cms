<?php

namespace App\Http\Resources\Post;

use App\Http\Resources\UploadFile\UploadFileResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostCategoryResource extends JsonResource
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
            'path' => $this->path,
            'description' => $this->description,
            'parent' => $this->parent ? new PostCategoryResource($this->parent) : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'translates' => $this->whenLoaded('translates', function () {
                return $this->translates->mapWithKeys(function ($translate) {
                    return [
                        $translate->locale => [
                            'name' => $translate->name,
                            'description' => $translate->description,
                        ]
                    ];
                });
            }),

            // Include SEO meta if loaded, otherwise null
            'seo_meta' => $this->whenLoaded('seoMeta', function () {
                $seo = $this->seoMeta;

                return [
                    'meta_title' => optional($seo)->meta_title,
                    'meta_description' => optional($seo)->meta_description,
                    'meta_image' => optional($seo)->image_id
                        ? new UploadFileResource($seo->image)
                        : null,
                ];
            }),
        ];
    }
}
