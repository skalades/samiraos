<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentType;
use App\Enums\UserRole;
use App\Models\Inventory;
use App\Models\NetworkBinding;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Services\OrderApprovalService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderApprovalServiceTest extends TestCase
{
    use RefreshDatabase;

    private OrderApprovalService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(OrderApprovalService::class);
    }

    public function test_distributor_can_approve_agen_order_and_inventory_moves()
    {
        $distributor = User::factory()->create(['role' => UserRole::Distributor]);
        $agen = User::factory()->create(['role' => UserRole::Agen]);
        
        $product = \App\Models\Product::create([
            'name' => 'Produk Z',
            'sku' => 'PROD-Z',
            'slug' => 'produk-z',
            'description' => 'Desc',
            'unit' => 'pcs',
            'weight_grams' => 100,
        ]);

        // Setup initial inventory for seller (distributor)
        Inventory::create([
            'user_id' => $distributor->id,
            'product_id' => $product->id,
            'qty' => 100,
        ]);

        // Setup order
        $order = Order::create([
            'order_number' => 'PO-123',
            'type' => OrderType::AgenToDistributor,
            'buyer_id' => $agen->id,
            'seller_id' => $distributor->id,
            'payment_type' => PaymentType::Cash,
            'status' => OrderStatus::Pending,
            'subtotal' => 50000,
            'discount' => 0,
            'total' => 50000,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'qty' => 10,
            'unit_price' => 5000,
            'subtotal' => 50000,
        ]);

        $approvedOrder = $this->service->approveOrder($order, $distributor);

        $this->assertEquals(OrderStatus::Approved, $approvedOrder->status);
        
        // Check seller inventory deducted (100 - 10 = 90)
        $this->assertDatabaseHas('inventories', [
            'user_id' => $distributor->id,
            'product_id' => $product->id,
            'qty' => 90,
        ]);

        // Check buyer inventory added (0 + 10 = 10)
        $this->assertDatabaseHas('inventories', [
            'user_id' => $agen->id,
            'product_id' => $product->id,
            'qty' => 10,
        ]);
        
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $distributor->id,
            'action_type' => \App\Enums\AuditAction::ApproveOrder->value,
        ]);
    }

    public function test_approve_tempo_order_increments_credit_used()
    {
        $superAdmin = User::factory()->create(['role' => UserRole::SuperAdmin]);
        $distributor = User::factory()->create(['role' => UserRole::Distributor]);
        $territory = \App\Models\Territory::create(['code' => 'T5', 'name' => 'T5', 'slug' => 't5']);
        
        NetworkBinding::create([
            'user_id' => $distributor->id,
            'role' => 'distributor',
            'territory_id' => $territory->id,
            'credit_limit' => 1000000,
            'credit_used' => 50000,
        ]);

        $order = Order::create([
            'order_number' => 'PO-456',
            'type' => OrderType::DistributorToPusat,
            'buyer_id' => $distributor->id,
            'seller_id' => $superAdmin->id,
            'payment_type' => PaymentType::Tempo,
            'status' => OrderStatus::Pending,
            'subtotal' => 100000,
            'discount' => 0,
            'total' => 100000,
        ]);

        $this->service->approveOrder($order, $superAdmin);

        // Credit used should be 50000 + 100000 = 150000
        $this->assertDatabaseHas('network_bindings', [
            'user_id' => $distributor->id,
            'credit_used' => 150000,
        ]);
    }
}
