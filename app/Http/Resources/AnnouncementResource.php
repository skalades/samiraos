<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementResource extends JsonResource
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
            'body' => $this->body,
            'type' => $this->type,
            'target_role' => $this->target_role,
            'attachment' => $this->attachment,
            'is_active' => $this->is_active,
            'published_at' => $this->published_at,
            'expires_at' => $this->expires_at,
            'publisher' => $this->whenLoaded('publisher', fn() => $this->publisher->only('id', 'name')),
        ];
    }
}
