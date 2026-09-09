<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'email' => $this->email,
            'role' => $this->whenLoaded('userRoles', function () {
                $userRole = $this->userRoles->first();

                return $userRole
                    ? [
                        'id' => $userRole->role->id,
                        'name' => $userRole->role->name,
                    ]
                    : null;
            }),
            'scope' => $this->whenLoaded('userScopes', function () {
                return $this->userScopes->map(function ($scope) {
                    return [
                        'resource_type' => $scope->resource_type,
                        'resource_id' => $scope->resource_id,
                        'mode' => $scope->mode,
                    ];
                });
            }),
        ];
    }
}
