<?php

namespace Tests\Feature;

use App\Enums\PaymentVerificationStatus;
use App\Enums\ReceivableStatus;
use App\Enums\UserRole;
use App\Models\CentralReceivable;
use App\Models\NetworkBinding;
use App\Models\Order;
use App\Models\ReceivablePayment;
use App\Models\User;
use App\Services\ReceivableService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReceivableServiceTest extends TestCase
{
    use RefreshDatabase;

    private ReceivableService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ReceivableService::class);
    }

    public function test_approve_payment_updates_receivable_and_restores_credit()
    {
        $admin = User::factory()->create(['role' => UserRole::SuperAdmin]);
        $distributor = User::factory()->create(['role' => UserRole::Distributor]);
        $territory = \App\Models\Territory::create(['code' => 'T6', 'name' => 'T6', 'slug' => 't6']);
        
        NetworkBinding::create([
            'user_id' => $distributor->id,
            'role' => 'distributor',
            'territory_id' => $territory->id,
            'credit_limit' => 1000000,
            'credit_used' => 500000, // 500k used
        ]);

        $order = Order::create([
            'order_number' => 'PO-123',
            'type' => \App\Enums\OrderType::DistributorToPusat,
            'buyer_id' => $distributor->id,
            'seller_id' => $admin->id,
            'payment_type' => \App\Enums\PaymentType::Tempo,
            'status' => \App\Enums\OrderStatus::Pending,
            'subtotal' => 500000,
            'discount' => 0,
            'total' => 500000,
        ]);

        $receivable = CentralReceivable::create([
            'order_id' => $order->id,
            'distributor_id' => $distributor->id,
            'invoice_number' => 'INV-123',
            'total_invoice' => 500000,
            'amount_paid' => 0,
            'remaining_balance' => 500000,
            'due_date' => now()->addDays(30),
            'status' => ReceivableStatus::Unpaid,
        ]);

        $payment = ReceivablePayment::create([
            'receivable_id' => $receivable->id,
            'amount' => 200000, // Partial payment
            'payment_proof' => 'proof.jpg',
            'bank_name' => 'BCA',
            'account_number' => '12345',
            'transfer_date' => now(),
            'status' => PaymentVerificationStatus::PendingVerification,
        ]);

        $approvedPayment = $this->service->approvePayment($payment, $admin);

        $this->assertEquals(PaymentVerificationStatus::Approved, $approvedPayment->status);
        
        // Assert receivable updated
        $this->assertDatabaseHas('central_receivables', [
            'id' => $receivable->id,
            'amount_paid' => 200000,
            'remaining_balance' => 300000,
            'status' => ReceivableStatus::PartiallyPaid->value,
        ]);

        // Assert credit restored
        $this->assertDatabaseHas('network_bindings', [
            'user_id' => $distributor->id,
            'credit_used' => 300000, // 500k - 200k
        ]);
        
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $admin->id,
            'action_type' => \App\Enums\AuditAction::ApprovePayment->value,
        ]);
    }

    public function test_full_payment_updates_status_to_paid()
    {
        $admin = User::factory()->create(['role' => UserRole::SuperAdmin]);
        $distributor = User::factory()->create(['role' => UserRole::Distributor]);
        $territory = \App\Models\Territory::create(['code' => 'T7', 'name' => 'T7', 'slug' => 't7']);
        
        NetworkBinding::create([
            'user_id' => $distributor->id,
            'role' => 'distributor',
            'territory_id' => $territory->id,
            'credit_limit' => 1000000,
            'credit_used' => 500000,
        ]);

        $order = Order::create([
            'order_number' => 'PO-456',
            'type' => \App\Enums\OrderType::DistributorToPusat,
            'buyer_id' => $distributor->id,
            'seller_id' => $admin->id,
            'payment_type' => \App\Enums\PaymentType::Tempo,
            'status' => \App\Enums\OrderStatus::Pending,
            'subtotal' => 500000,
            'discount' => 0,
            'total' => 500000,
        ]);

        $receivable = CentralReceivable::create([
            'order_id' => $order->id,
            'distributor_id' => $distributor->id,
            'invoice_number' => 'INV-456',
            'total_invoice' => 500000,
            'amount_paid' => 0,
            'remaining_balance' => 500000,
            'due_date' => now()->addDays(30),
            'status' => ReceivableStatus::Unpaid,
        ]);

        $payment = ReceivablePayment::create([
            'receivable_id' => $receivable->id,
            'amount' => 500000, // Full payment
            'payment_proof' => 'proof2.jpg',
            'bank_name' => 'BCA',
            'account_number' => '12345',
            'transfer_date' => now(),
            'status' => PaymentVerificationStatus::PendingVerification,
        ]);

        $this->service->approvePayment($payment, $admin);

        // Assert receivable updated to paid
        $this->assertDatabaseHas('central_receivables', [
            'id' => $receivable->id,
            'amount_paid' => 500000,
            'remaining_balance' => 0,
            'status' => ReceivableStatus::Paid->value,
        ]);

        // Assert credit restored fully
        $this->assertDatabaseHas('network_bindings', [
            'user_id' => $distributor->id,
            'credit_used' => 0,
        ]);
    }
}
