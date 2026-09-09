<?php

namespace App\Http\Resources\Package;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IndexPackageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "number" => $this->number,
            "name" => $this->name,
            "subtitle" => $this->subtitle,
            "test_categories" => $this->testCategories->pluck('name')->implode(', '),
            "package_categories" => $this->categories->pluck('name')->implode(', '),
            "package_status" => $this->packageStatus ? $this->packageStatus->name : null,
            "age_group" => $this->age_group,
            "price" => $this->price,
            "order_id" => $this->order_id,
            "is_featured" => (bool) $this->is_featured,
            "created_at" => $this->created_at,
            "updated_at" => $this->updated_at,
        ];
    }
}
