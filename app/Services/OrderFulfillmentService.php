<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class OrderFulfillmentService
{
    public function __construct(
        private readonly InventoryService $inventoryService,
        private readonly AuditService $auditService,
    ) {}

    /**
     * Set order ke status shipped.
     *
     * @param  Order $order
     * @return Order
     */
    public function shipOrder(Order $order): Order
    {
        if (! $order->canBeShipped()) {
            throw new RuntimeException("Order {$order->order_number} tidak bisa dikirim. Status: {$order->status->value}");
        }

        return DB::transaction(function () use ($order) {
            $oldValues = $order->toArray();

            $order->update([
                'status' => OrderStatus::Shipped,
                'shipped_at' => now(),
            ]);

            $this->auditService->log(
                user: $order->seller ?? $order->buyer, // Pusat tidak punya user, fallback ke buyer
                actionType: \App\Enums\AuditAction::ShipOrder,
                description: "Order {$order->order_number} dikirim",
                entity: $order,
                oldValues: $oldValues,
                newValues: $order->fresh()->toArray()
            );

            return $order->fresh();
        });
    }

    /**
     * Set order ke status delivered (buyer konfirmasi terima).
     *
     * @param  Order $order
     * @return Order
     */
    public function deliverOrder(Order $order): Order
    {
        if (! $order->canBeDelivered()) {
            throw new RuntimeException("Order {$order->order_number} tidak bisa di-deliver. Status: {$order->status->value}");
        }

        return DB::transaction(function () use ($order) {
            $oldValues = $order->toArray();

            $order->update([
                'status' => OrderStatus::Delivered,
                'delivered_at' => now(),
            ]);

            $this->auditService->log(
                user: $order->buyer,
                actionType: \App\Enums\AuditAction::CompleteOrder,
                description: "Order {$order->order_number} diterima oleh {$order->buyer->name}",
                entity: $order,
                oldValues: $oldValues,
                newValues: $order->fresh()->toArray()
            );

            return $order->fresh();
        });
    }

    /**
     * Batalkan order.
     *
     * @param  Order $order
     * @param  User  $canceller
     * @return Order
     */
    public function cancelOrder(Order $order, User $canceller): Order
    {
        if (! $order->canBeCancelled()) {
            throw new RuntimeException("Order {$order->order_number} tidak bisa dibatalkan. Status: {$order->status->value}");
        }

        return DB::transaction(function () use ($order, $canceller) {
            $oldValues = $order->toArray();
            $wasApproved = $order->status === OrderStatus::Approved;

            $order->update(['status' => OrderStatus::Cancelled]);

            // Jika sudah approved, kembalikan stok
            if ($wasApproved) {
                foreach ($order->items as $item) {
                    // Kembalikan stok ke seller
                    if ($order->seller_id) {
                        $this->inventoryService->addStock(
                            $order->seller,
                            $item->product_id,
                            $item->qty,
                            "Cancelled order {$order->order_number} - stock returned"
                        );
                    }

                    // Kurangi stok buyer
                    $this->inventoryService->deductStock(
                        $order->buyer,
                        $item->product_id,
                        $item->qty,
                        "Cancelled order {$order->order_number} - stock returned"
                    );
                }

                // Kembalikan credit jika tempo
                if ($order->isTempo() && $order->buyer->networkBinding) {
                    $binding = $order->buyer->networkBinding;
                    $binding->decrement('credit_used', $order->total);
                }
            }

            $this->auditService->log(
                user: $canceller,
                actionType: \App\Enums\AuditAction::CancelOrder,
                description: "Order {$order->order_number} dibatalkan oleh {$canceller->name}",
                entity: $order,
                oldValues: $oldValues,
                newValues: $order->fresh()->toArray()
            );

            return $order->fresh();
        });
    }
}
