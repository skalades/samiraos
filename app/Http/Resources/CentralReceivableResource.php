<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CentralReceivableResource extends JsonResource
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
            'invoice_number' => $this->invoice_number,
            'total_invoice' => $this->total_invoice,
            'amount_paid' => $this->amount_paid,
            'remaining_balance' => $this->remaining_balance,
            'due_date' => $this->due_date,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'distributor' => $this->whenLoaded('distributor', fn() => $this->distributor->only('id', 'name')),
            'payments' => $this->whenLoaded('payments'),
        ];
    }
}
