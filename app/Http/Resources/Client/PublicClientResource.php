<?php

namespace App\Http\Resources\Client;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicClientResource extends JsonResource
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
            'surname' => $this->surname,
            'full_name' => $this->name . ' ' . $this->surname,

            'email' => $this->email,

            'phone' => $this->phone,
            'phone_code' => $this->phone_code,
            'phone_full' => '+' . $this->phone_code . ' ' . $this->phone,

            'address' => $this->address,
        ];
    }
}
