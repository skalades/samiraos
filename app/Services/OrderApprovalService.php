<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class OrderApprovalService
{
    public function __construct(
        private readonly InventoryService $inventoryService,
        private readonly AuditService $auditService,
    ) {}

    /**
     * Approve order oleh seller/admin.
     * Pindahkan stok dari seller ke buyer.
     *
     * @param  Order $order
     * @param  User  $approver
     * @return Order
     *
     * @throws RuntimeException
     */
    public function approveOrder(Order $order, User $approver): Order
    {
        if (! $order->canBeApproved()) {
            throw new RuntimeException("Order {$order->order_number} tidak bisa di-approve. Status: {$order->status->value}");
        }

        $this->validateApproverAuthority($order, $approver);

        return DB::transaction(function () use ($order, $approver) {
            $oldValues = $order->toArray();

            $order->update(['status' => OrderStatus::Approved]);

            // Pindahkan stok: deduct dari seller, add ke buyer
            foreach ($order->items as $item) {
                // Deduct dari seller (jika bukan pusat)
                if ($order->seller_id) {
                    $this->inventoryService->deductStock(
                        $order->seller,
                        $item->product_id,
                        $item->qty,
                        "Approved order {$order->order_number}"
                    );
                }

                // Add ke buyer
                $this->inventoryService->addStock(
                    $order->buyer,
                    $item->product_id,
                    $item->qty,
                    "Approved order {$order->order_number}"
                );
            }

            // Update credit_used jika tempo
            if ($order->isTempo() && $order->buyer->networkBinding) {
                $binding = $order->buyer->networkBinding;
                $binding->increment('credit_used', $order->total);
            }

            $this->auditService->log(
                user: $approver,
                actionType: \App\Enums\AuditAction::ApproveOrder,
                description: "Order {$order->order_number} disetujui oleh {$approver->name}",
                entity: $order,
                oldValues: $oldValues,
                newValues: $order->fresh()->toArray()
            );

            return $order->fresh(['items.product', 'buyer', 'seller']);
        });
    }

    /**
     * Reject order.
     *
     * @param  Order  $order
     * @param  User   $rejecter
     * @param  string $reason
     * @return Order
     */
    public function rejectOrder(Order $order, User $rejecter, string $reason): Order
    {
        if (! $order->canBeApproved()) {
            throw new RuntimeException("Order {$order->order_number} tidak bisa di-reject. Status: {$order->status->value}");
        }

        return DB::transaction(function () use ($order, $rejecter, $reason) {
            $oldValues = $order->toArray();

            $order->update([
                'status' => OrderStatus::Rejected,
                'rejection_reason' => $reason,
            ]);

            $this->auditService->log(
                user: $rejecter,
                actionType: \App\Enums\AuditAction::RejectOrder,
                description: "Order {$order->order_number} ditolak: {$reason}",
                entity: $order,
                oldValues: $oldValues,
                newValues: $order->fresh()->toArray()
            );

            return $order->fresh();
        });
    }

    /**
     * Validasi approver memiliki authority atas order.
     */
    private function validateApproverAuthority(Order $order, User $approver): void
    {
        // Super admin bisa approve semua
        if ($approver->isSuperAdmin()) {
            return;
        }

        // Distributor bisa approve order dari agen-nya
        if ($order->type === OrderType::AgenToDistributor && $order->seller_id === $approver->id) {
            return;
        }

        throw new RuntimeException("User {$approver->name} tidak memiliki authority untuk approve order ini.");
    }
}
