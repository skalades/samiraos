<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityLogResource extends JsonResource
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
            'action_type' => $this->action_type,
            'description' => $this->description,
            'ip_address' => $this->ip_address,
            'created_at' => $this->created_at,
            'user' => $this->whenLoaded('user', fn() => $this->user->only('id', 'name', 'role')),
        ];
    }
}
