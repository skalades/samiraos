<?php

namespace App\Services;

use App\Contracts\Services\OrderCreationServiceInterface;
use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentType;
use App\Enums\PriceTier;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class OrderCreationService implements OrderCreationServiceInterface
{
    public function __construct(
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
                actionType: \App\Enums\AuditAction::CreateOrder,
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
            
            if (!$superAdmin) {
                throw new RuntimeException('Super Admin tidak ditemukan di sistem. Konfigurasi tidak valid.');
            }

            return [
                'type' => OrderType::DistributorToPusat,
                'seller_id' => $superAdmin->id,
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
}
