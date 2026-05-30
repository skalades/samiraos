<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $territory = \App\Models\Territory::create(['code' => 'T-REG', 'name' => 'Registration Territory', 'slug' => 't-reg']);
        $distributor = \App\Models\User::factory()->create(['role' => \App\Enums\UserRole::Distributor]);
        \App\Models\NetworkBinding::create([
            'user_id' => $distributor->id,
            'role' => 'distributor',
            'territory_id' => $territory->id,
        ]);

        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'territory_id' => $territory->id,
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }
}
