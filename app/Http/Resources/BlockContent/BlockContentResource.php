<?php

namespace App\Http\Resources\BlockContent;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlockContentResource extends JsonResource
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
            'component_name' => $this->component_name,
            'page_id' => $this->page_id,
            'page' => [
                'id' => $this->page->id,
                'page_name' => $this->page->page_name,
                'path' => $this->page->path,
            ],
            'content' => $this->content,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
