<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Define a dummy route protected by the role middleware
        Route::middleware(['web', 'auth', 'role:super_admin,distributor'])->get('/protected-route', function () {
            return response('Protected Content', 200);
        });
    }

    public function test_unauthenticated_user_is_redirected()
    {
        $response = $this->get('/protected-route');
        $response->assertRedirect('/login');
    }

    public function test_authorized_role_can_access()
    {
        $user = User::factory()->create(['role' => UserRole::SuperAdmin]);
        
        $response = $this->actingAs($user)->get('/protected-route');
        
        $response->assertStatus(200);
        $response->assertSee('Protected Content');

        $distributor = User::factory()->create(['role' => UserRole::Distributor]);
        $responseDist = $this->actingAs($distributor)->get('/protected-route');
        $responseDist->assertStatus(200);
    }

    public function test_unauthorized_role_gets_403()
    {
        $agen = User::factory()->create(['role' => UserRole::Agen]);
        
        $response = $this->actingAs($agen)->get('/protected-route');
        
        $response->assertStatus(403);
    }
}
