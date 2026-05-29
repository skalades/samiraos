<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentType;
use App\Enums\PriceTier;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class OrderService
{
    public function __construct(
        private readonly InventoryService $inventoryService,
        private readonly ReceivableService $receivableService,
        private readonly AuditService $auditService,
    ) {}

    /**
     * Buat order baru (PO) dari buyer.
     *
     * Flow:
     * - Agen → seller = parent distributor, type = agen_to_distributor, harus cash
     * - Distributor → seller = null (pusat), type = distributor_to_pusat, bisa cash/tempo
     * - Jika tempo → validasi credit limit cukup
     *
     * @param  User         $buyer       User yang membuat order
     * @param  array<int, array{product_id: int, qty: int}> $items Daftar item yang dipesan
     * @param  PaymentType  $paymentType Tipe pembayaran (cash/tempo)
     * @param  string|null  $notes       Catatan order
     * @return Order
     *
     * @throws InvalidArgumentException
     * @throws RuntimeException
     */
    public function createOrder(
        User $buyer,
        array $items,
        PaymentType $paymentType,
        ?string $notes = null
    ): Order {
        // Validasi role buyer dan tentukan seller + type
        $orderConfig = $this->resolveOrderConfig($buyer, $paymentType);

        // Hitung total dari items
        $calculatedItems = $this->calculateOrderItems($items, $orderConfig['price_tier']);
        $subtotal = collect($calculatedItems)->sum('subtotal');
        $discount = 0.0;
        $total = $subtotal - $discount;

        // Validasi credit limit untuk pembayaran tempo
        if ($paymentType === PaymentType::Tempo) {
            $this->validateCreditLimit($buyer, $total);
        }

        return DB::transaction(function () use (
            $buyer, $orderConfig, $paymentType, $calculatedItems,
            $subtotal, $discount, $total, $notes
        ) {
            // Buat order
            $order = Order::create([
                'type' => $orderConfig['type'],
                'buyer_id' => $buyer->id,
                'seller_id' => $orderConfig['seller_id'],
                'payment_type' => $paymentType,
                'status' => OrderStatus::Pending,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
                'notes' => $notes,
            ]);

            // Buat order items
            foreach ($calculatedItems as $item) {
                $order->items()->create($item);
            }

            // Jika tempo, buat receivable
            if ($paymentType === PaymentType::Tempo) {
                $this->receivableService->createReceivable($order);
            }

            // Audit log
            $this->auditService->log(
                user: $buyer,
                actionType: 'order_created',
                description: "Order {$order->order_number} dibuat oleh {$buyer->name}",
                entity: $order,
                newValues: $order->toArray()
            );

            // TODO: Fire OrderCreated event
            // event(new \App\Events\OrderCreated($order));

            return $order->load('items.product');
        });
    }

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
                actionType: 'order_approved',
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
                actionType: 'order_rejected',
                description: "Order {$order->order_number} ditolak: {$reason}",
                entity: $order,
                oldValues: $oldValues,
                newValues: $order->fresh()->toArray()
            );

            return $order->fresh();
        });
    }

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
                actionType: 'order_shipped',
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
                actionType: 'order_delivered',
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
                actionType: 'order_cancelled',
                description: "Order {$order->order_number} dibatalkan oleh {$canceller->name}",
                entity: $order,
                oldValues: $oldValues,
                newValues: $order->fresh()->toArray()
            );

            return $order->fresh();
        });
    }

    // ─── Private Helpers ──────────────────────────────────────

    /**
     * Tentukan konfigurasi order berdasarkan role buyer.
     *
     * @return array{type: OrderType, seller_id: int|null, price_tier: PriceTier}
     */
    private function resolveOrderConfig(User $buyer, PaymentType $paymentType): array
    {
        if ($buyer->isAgen()) {
            // Agen harus pakai cash
            if ($paymentType !== PaymentType::Cash) {
                throw new InvalidArgumentException('Agen hanya bisa menggunakan pembayaran cash.');
            }

            $parentDistributor = $buyer->getParentDistributor();
            if (! $parentDistributor) {
                throw new RuntimeException('Agen tidak memiliki parent distributor.');
            }

            return [
                'type' => OrderType::AgenToDistributor,
                'seller_id' => $parentDistributor->id,
                'price_tier' => PriceTier::Agen,
            ];
        }

        if ($buyer->isDistributor()) {
            $superAdmin = \App\Models\User::where('role', \App\Enums\UserRole::SuperAdmin)->first();
            
            return [
                'type' => OrderType::DistributorToPusat,
                'seller_id' => $superAdmin?->id ?? 1, // Gunakan ID super admin
                'price_tier' => PriceTier::Distributor,
            ];
        }

        throw new InvalidArgumentException("Role {$buyer->role->value} tidak bisa membuat order.");
    }

    /**
     * Hitung item order berdasarkan harga tier.
     *
     * @param  array<int, array{product_id: int, qty: int}> $items
     * @param  PriceTier $priceTier
     * @return array<int, array{product_id: int, qty: int, unit_price: float, subtotal: float}>
     */
    private function calculateOrderItems(array $items, PriceTier $priceTier): array
    {
        $calculated = [];

        foreach ($items as $item) {
            $product = \App\Models\Product::findOrFail($item['product_id']);
            $unitPrice = $product->getPriceForTierAndQty($priceTier, $item['qty'])
                ?? $product->getPriceForTier($priceTier);

            if ($unitPrice === null) {
                throw new RuntimeException("Harga tidak ditemukan untuk produk {$product->name} pada tier {$priceTier->value}.");
            }

            $calculated[] = [
                'product_id' => $item['product_id'],
                'qty' => $item['qty'],
                'unit_price' => $unitPrice,
                'subtotal' => $unitPrice * $item['qty'],
            ];
        }

        return $calculated;
    }

    /**
     * Validasi credit limit cukup untuk total order.
     */
    private function validateCreditLimit(User $buyer, float $total): void
    {
        $remaining = $buyer->getCreditRemaining();

        if ($remaining < $total) {
            throw new RuntimeException(
                "Credit limit tidak cukup. Sisa: Rp " . number_format($remaining, 0, ',', '.') .
                ", Dibutuhkan: Rp " . number_format($total, 0, ',', '.')
            );
        }
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
