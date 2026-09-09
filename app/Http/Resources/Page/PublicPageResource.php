<?php

namespace App\Http\Resources\Page;

use App\Http\Resources\BlockContent\PublicBlockContentResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicPageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     * 
     * Returns pages organized by page_name with their block contents:
     * [
     *   'home' => [
     *     'path' => '/',
     *     'content' => [ 'title' => [ 'en' => {...}, 'gr' => {...} ] ]
     *   ]
     * ]
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'path' => $this->path,
            'content' => $this->blockContents->mapWithKeys(function ($blockContent) {
                $transformed = new PublicBlockContentResource($blockContent);
                return $transformed->toArray(request());
            })->toArray(),
        ];
    }
}
