<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Territory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'latitude',
        'longitude',
        'max_stock_capacity',
        'geojson_feature',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'max_stock_capacity' => 'integer',
            'geojson_feature' => 'array',
            'is_active' => 'boolean',
        ];
    }

    // ─── Relationships ────────────────────────────────────────

    /**
     * Semua network binding yang terkait territory ini.
     */
    public function networkBindings(): HasMany
    {
        return $this->hasMany(NetworkBinding::class);
    }

    /**
     * Distributor yang beroperasi di territory ini.
     */
    public function distributors(): HasManyThrough
    {
        return $this->hasManyThrough(
            User::class,
            NetworkBinding::class,
            'territory_id', // FK on network_bindings
            'id',           // PK on users
            'id',           // PK on territories
            'user_id'       // FK on network_bindings → users
        )->where('network_bindings.role', UserRole::Distributor->value);
    }

    /**
     * Agen yang beroperasi di territory ini.
     */
    public function agents(): HasManyThrough
    {
        return $this->hasManyThrough(
            User::class,
            NetworkBinding::class,
            'territory_id',
            'id',
            'id',
            'user_id'
        )->where('network_bindings.role', UserRole::Agen->value);
    }

    // ─── Helpers ──────────────────────────────────────────────

    /**
     * Hitung persentase total stok terhadap kapasitas maks territory.
     * Menghitung dari semua inventori user yang terikat di territory ini.
     */
    public function getStockPercentage(): float
    {
        if ($this->max_stock_capacity <= 0) {
            return 0.0;
        }

        $totalStock = Inventory::whereIn(
            'user_id',
            $this->networkBindings()->pluck('user_id')
        )->sum('qty');

        return round(($totalStock / $this->max_stock_capacity) * 100, 2);
    }
}
