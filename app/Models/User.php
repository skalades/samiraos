<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'address',
        'is_active',
        'avatar',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'is_active' => 'boolean',
        ];
    }

    // ─── Relationships ────────────────────────────────────────

    /**
     * Binding user ke jaringan distribusi (territory, parent, credit).
     */
    public function networkBinding(): HasOne
    {
        return $this->hasOne(NetworkBinding::class);
    }

    /**
     * Territory user melalui network binding.
     */
    public function territory(): HasOneThrough
    {
        return $this->hasOneThrough(
            Territory::class,
            NetworkBinding::class,
            'user_id',       // FK on network_bindings
            'id',            // PK on territories
            'id',            // PK on users
            'territory_id'   // FK on network_bindings → territories
        );
    }

    /**
     * Log aktivitas user (audit trail).
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * Inventori / stok yang dimiliki user.
     */
    public function inventory(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }

    /**
     * Order yang dibuat user sebagai buyer.
     */
    public function ordersAsBuyer(): HasMany
    {
        return $this->hasMany(Order::class, 'buyer_id');
    }

    /**
     * Order yang diterima user sebagai seller.
     */
    public function ordersAsSeller(): HasMany
    {
        return $this->hasMany(Order::class, 'seller_id');
    }

    // ─── Role Helpers ─────────────────────────────────────────

    /**
     * Apakah user adalah Super Admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === UserRole::SuperAdmin;
    }

    /**
     * Apakah user adalah Distributor.
     */
    public function isDistributor(): bool
    {
        return $this->role === UserRole::Distributor;
    }

    /**
     * Apakah user adalah Agen.
     */
    public function isAgen(): bool
    {
        return $this->role === UserRole::Agen;
    }

    // ─── Business Logic Helpers ───────────────────────────────

    /**
     * Ambil territory yang terkait dengan user.
     */
    public function getTerritory(): ?Territory
    {
        return $this->networkBinding?->territory;
    }

    /**
     * Ambil distributor parent untuk agen.
     * Jika user bukan agen, return null.
     */
    public function getParentDistributor(): ?User
    {
        if (! $this->isAgen()) {
            return null;
        }

        return $this->networkBinding?->parent;
    }

    /**
     * Ambil credit limit dari network binding (untuk distributor).
     */
    public function getCreditLimit(): float
    {
        return (float) ($this->networkBinding?->credit_limit ?? 0);
    }

    /**
     * Ambil credit yang sudah dipakai (untuk distributor).
     */
    public function getCreditUsed(): float
    {
        return (float) ($this->networkBinding?->credit_used ?? 0);
    }

    /**
     * Sisa credit yang tersedia (limit - used).
     */
    public function getCreditRemaining(): float
    {
        return $this->getCreditLimit() - $this->getCreditUsed();
    }

    /**
     * Ambil informasi credit lengkap sebagai array.
     */
    public function getCreditInfo(): array
    {
        return [
            'credit_limit' => $this->getCreditLimit(),
            'credit_used' => $this->getCreditUsed(),
            'credit_remaining' => $this->getCreditRemaining(),
        ];
    }
}
