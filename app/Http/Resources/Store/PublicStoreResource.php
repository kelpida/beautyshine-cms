<?php

namespace App\Http\Resources\Store;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicStoreResource extends JsonResource
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
            'name_translations' => $this->whenLoaded(
                'translations',
                fn () => $this->translations
                    ->pluck('name', 'locale')
                    ->filter()
                    ->toArray(),
                []
            ),
            'slug' => $this->slug,
            'address' => $this->address,
            'address_translations' => $this->whenLoaded(
                'translations',
                fn () => $this->translations
                    ->pluck('address', 'locale')
                    ->filter()
                    ->toArray(),
                []
            ),
            'phone' => $this->phone,
            'phone_code' => $this->phone_code,
            'fax' => $this->fax,
            'email' => $this->email,
            'map_url' => $this->map_url,
        ];
    }
}
