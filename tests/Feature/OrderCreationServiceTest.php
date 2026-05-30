<?php

namespace Tests\Feature;

use App\Enums\OrderType;
use App\Enums\PaymentType;
use App\Enums\PriceTier;
use App\Enums\UserRole;
use App\Models\NetworkBinding;
use App\Models\Product;
use App\Models\ProductPrice;
use App\Models\User;
use App\Services\OrderCreationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use RuntimeException;
use Tests\TestCase;
use InvalidArgumentException;

class OrderCreationServiceTest extends TestCase
{
    use RefreshDatabase;

    private OrderCreationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(OrderCreationService::class);
    }

    public function test_distributor_can_create_order_to_super_admin()
    {
        $superAdmin = User::factory()->create(['role' => UserRole::SuperAdmin]);
        
        $distributor = User::factory()->create(['role' => UserRole::Distributor]);
        $territory = \App\Models\Territory::create(['code' => 'T1', 'name' => 'T1', 'slug' => 't1']);
        
        NetworkBinding::create([
            'user_id' => $distributor->id,
            'role' => 'distributor',
            'territory_id' => $territory->id,
            'credit_limit' => 1000000,
            'credit_used' => 0,
        ]);

        $product = Product::create([
            'name' => 'Produk A',
            'sku' => 'PROD-A',
            'slug' => 'produk-a',
            'description' => 'Desc',
            'unit' => 'pcs',
            'weight_grams' => 100,
        ]);

        ProductPrice::create([
            'product_id' => $product->id,
            'tier' => PriceTier::Distributor,
            'price' => 10000,
            'min_qty' => 1,
        ]);

        $items = [
            ['product_id' => $product->id, 'qty' => 5],
        ];

        $order = $this->service->createOrder(
            buyer: $distributor,
            items: $items,
            paymentType: PaymentType::Tempo,
            notes: 'Test note'
        );

        $this->assertNotNull($order);
        $this->assertEquals(OrderType::DistributorToPusat, $order->type);
        $this->assertEquals($superAdmin->id, $order->seller_id);
        $this->assertEquals(50000, $order->total); // 5 * 10000
        
        // Assert receivable created
        $this->assertDatabaseHas('central_receivables', [
            'order_id' => $order->id,
            'distributor_id' => $distributor->id,
            'total_invoice' => 50000,
        ]);
        
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $distributor->id,
            'action_type' => \App\Enums\AuditAction::CreateOrder->value,
        ]);
    }

    public function test_distributor_credit_limit_validation_throws_exception()
    {
        $superAdmin = User::factory()->create(['role' => UserRole::SuperAdmin]);
        $distributor = User::factory()->create(['role' => UserRole::Distributor]);
        $territory = \App\Models\Territory::create(['code' => 'T2', 'name' => 'T2', 'slug' => 't2']);
        
        NetworkBinding::create([
            'user_id' => $distributor->id,
            'role' => 'distributor',
            'territory_id' => $territory->id,
            'credit_limit' => 10000, // Very small limit
            'credit_used' => 0,
        ]);

        $product = Product::create([
            'name' => 'Produk B',
            'sku' => 'PROD-B',
            'slug' => 'produk-b',
            'description' => 'Desc',
            'unit' => 'pcs',
            'weight_grams' => 100,
        ]);

        ProductPrice::create([
            'product_id' => $product->id,
            'tier' => PriceTier::Distributor,
            'price' => 20000,
            'min_qty' => 1,
        ]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Credit limit tidak cukup');

        $this->service->createOrder(
            buyer: $distributor,
            items: [['product_id' => $product->id, 'qty' => 1]],
            paymentType: PaymentType::Tempo
        );
    }

    public function test_agen_can_create_order_to_distributor()
    {
        $superAdmin = User::factory()->create(['role' => UserRole::SuperAdmin]);
        $distributor = User::factory()->create(['role' => UserRole::Distributor]);
        $territory = \App\Models\Territory::create(['code' => 'T3', 'name' => 'T3', 'slug' => 't3']);
        
        $agen = User::factory()->create(['role' => UserRole::Agen]);
        
        NetworkBinding::create([
            'user_id' => $agen->id,
            'parent_id' => $distributor->id,
            'territory_id' => $territory->id,
            'role' => 'agen',
        ]);

        $product = Product::create([
            'name' => 'Produk C',
            'sku' => 'PROD-C',
            'slug' => 'produk-c',
            'description' => 'Desc',
            'unit' => 'pcs',
            'weight_grams' => 100,
        ]);

        ProductPrice::create([
            'product_id' => $product->id,
            'tier' => PriceTier::Agen,
            'price' => 12000,
            'min_qty' => 1,
        ]);

        $order = $this->service->createOrder(
            buyer: $agen,
            items: [['product_id' => $product->id, 'qty' => 2]],
            paymentType: PaymentType::Cash
        );

        $this->assertNotNull($order);
        $this->assertEquals(OrderType::AgenToDistributor, $order->type);
        $this->assertEquals($distributor->id, $order->seller_id);
        $this->assertEquals(24000, $order->total);
    }
    
    public function test_agen_cannot_use_tempo()
    {
        $distributor = User::factory()->create(['role' => UserRole::Distributor]);
        $agen = User::factory()->create(['role' => UserRole::Agen]);
        $territory = \App\Models\Territory::create(['code' => 'T4', 'name' => 'T4', 'slug' => 't4']);
        
        NetworkBinding::create([
            'user_id' => $agen->id,
            'parent_id' => $distributor->id,
            'territory_id' => $territory->id,
            'role' => 'agen',
        ]);

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Agen hanya bisa menggunakan pembayaran cash.');

        $this->service->createOrder(
            buyer: $agen,
            items: [],
            paymentType: PaymentType::Tempo
        );
    }
}
