<?php

namespace App\Contracts\Services;

use App\Models\CentralReceivable;
use App\Models\Order;
use App\Models\ReceivablePayment;
use App\Models\User;

interface ReceivableServiceInterface
{
    public function createReceivable(Order $order, int $dueDays = 30): CentralReceivable;
    public function submitPayment(CentralReceivable $receivable, array $data): ReceivablePayment;
    public function approvePayment(ReceivablePayment $payment, User $admin): ReceivablePayment;
    public function rejectPayment(ReceivablePayment $payment, User $admin, string $reason): ReceivablePayment;
    public function checkOverdueReceivables(): void;
}
