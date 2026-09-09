<?php

namespace App\Http\Resources\Package;

use App\Http\Resources\Package\Attributes\PublicAttributeResource;
use App\Http\Resources\UploadFile\ImageResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class PublicPackageResource extends JsonResource
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
            'number' => $this->number,
            'name' => html_entity_decode($this->name, ENT_QUOTES | ENT_HTML5),
            'path' => $this->path,
            'subtitle' => $this->subtitle,
            'description' => $this->description,
            'price' => auth('sanctum')->check() ? $this->price : null,
            'category' => $this->packageCategory ? $this->packageCategory->name : null, // Backwards compatibility
            'package_category' => $this->packageCategory ? [
                'id' => $this->packageCategory->id,
                'name' => $this->packageCategory->name,
                'key' => $this->packageCategory->key,
            ] : null,
            'age_group' => $this->age_group,
            'purpose' => $this->purpose,
            'preparation' => $this->preparation,
            'tests' => $this->tests,
            'test_categories' => $this->testCategories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'key' => $category->key,
                ];
            })->values(),
            'faq' => $this->faq,
            'main_image' => new ImageResource($this->mainImage),
            'gallery' => ImageResource::collection($this->gallery),
            'attributes' => (function () {
                $attributes = $this->attributes->load([
                    'attributeCategory.translates',
                    'translates',
                    'options.translates',
                ]);

                return $attributes->groupBy(function ($attribute) {
                    return $attribute->attributeCategory ? Str::of($attribute->attributeCategory->key)->replace('-', '_') : 'empty';
                })->map(function ($attributes) {
                    return PublicAttributeResource::collection($attributes);
                });
            })(),
            'translates' => $this->translates->mapWithKeys(function ($translation) {
                return [
                    $translation->locale => [
                        'name' => html_entity_decode($translation->name, ENT_QUOTES | ENT_HTML5),
                        'description' => $translation->description,
                    ]
                ];
            }),
            'is_featured' => (bool) $this->is_featured,
        ];
    }
}
