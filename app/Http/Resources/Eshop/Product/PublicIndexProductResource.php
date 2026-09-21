<?php

namespace App\Http\Resources\Eshop\Product;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicIndexProductResource extends JsonResource
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
            'sku' => $this->sku,
            'name' => $this->name,
            'short_description' => $this->short_description,
            'price' => $this->price,
            'sale_price' => $this->sale_price,
            'main_image' => $this->main_image,
            'gallery_images' => $this->gallery_images,
            'categories' => $this->categories,
            'tags' => $this->tags,
            'attributes' => $this->attributes,
            'variations' => $this->variations,
            'addons' => $this->addons,
            'custom_fields' => $this->custom_fields,
        ];
    }
}
