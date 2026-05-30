<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
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
            'order_number' => $this->order_number,
            'type' => $this->type,
            'payment_type' => $this->payment_type,
            'status' => $this->status,
            'total' => $this->total,
            'created_at' => $this->created_at,
            'buyer' => $this->whenLoaded('buyer', fn() => $this->buyer->only('id', 'name')),
            'seller' => $this->whenLoaded('seller', fn() => $this->seller->only('id', 'name')),
            'items' => $this->whenLoaded('items', fn() => $this->items->map(fn($item) => [
                'id' => $item->id,
                'qty' => $item->qty,
                'price' => $item->price,
                'subtotal' => $item->subtotal,
                'product' => $item->relationLoaded('product') ? $item->product->only('id', 'name', 'sku') : null,
            ])),
        ];
    }
}
