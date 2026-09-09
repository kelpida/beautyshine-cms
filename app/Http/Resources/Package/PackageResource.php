<?php

namespace App\Http\Resources\Package;

use App\Http\Resources\Package\Attributes\PackageAttributeResource;
use App\Http\Resources\Package\PackageCategory\PackageCategoryResource;
use App\Http\Resources\UploadFile\UploadFileResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PackageResource extends JsonResource
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
            'name' => $this->name,
            'path' => $this->path,
            'subtitle' => $this->subtitle,
            'description' => $this->description,
            'price' => $this->price,
            'category' => $this->category,
            'age_group' => $this->age_group,
            'purpose' => $this->purpose,
            'preparation' => $this->preparation,
            'tests' => $this->tests,
            'duration' => $this->duration,
            'faq' => $this->faq,
            'main_image' => new UploadFileResource($this->mainImage),
            'gallery' => UploadFileResource::collection($this->gallery),
            'attributes' => PackageAttributeResource::collection($this->attributes),
            'packageCapacities' => $this->packageCapacities->map(function ($capacity) {
                return [
                    'store_id' => $capacity->store_id,
                    'max_bookings' => $capacity->max_concurrent_bookings,
                ];
            }),
            'test_categories' => $this->testCategories,
            'package_categories' => $this->categories ? PackageCategoryResource::collection($this->categories) : [],
            'package_gender' => $this->packageGender,
            'package_age' => $this->packageAge,
            'package_status' => $this->packageStatus,
            'translates' => $this->translates,
            'is_featured' => (bool) $this->is_featured,
            'created_at' => $this->created_at,
        ];
    }
}
