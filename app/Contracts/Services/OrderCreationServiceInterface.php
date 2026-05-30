<?php

namespace App\Contracts\Services;

use App\Enums\PaymentType;
use App\Models\Order;
use App\Models\User;

interface OrderCreationServiceInterface
{
    public function createOrder(User $buyer, array $items, PaymentType $paymentType, ?string $notes = null): Order;
}
