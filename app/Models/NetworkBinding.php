<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NetworkBinding extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'role',
        'territory_id',
        'parent_id',
        'credit_limit',
        'credit_used',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'role' => UserRole::class,
            'credit_limit' => 'float',
            'credit_used' => 'float',
        ];
    }

    // ─── Relationships ────────────────────────────────────────

    /**
     * User pemilik binding ini.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Territory tempat user beroperasi.
     */
    public function territory(): BelongsTo
    {
        return $this->belongsTo(Territory::class);
    }

    /**
     * Parent distributor (untuk agen).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    /**
     * Agen-agen yang di bawah distributor ini.
     */
    public function children(): HasMany
    {
        return $this->hasMany(NetworkBinding::class, 'parent_id', 'user_id');
    }

    // ─── Helpers ──────────────────────────────────────────────

    /**
     * Sisa credit yang tersedia.
     */
    public function getCreditRemaining(): float
    {
        return (float) ($this->credit_limit - $this->credit_used);
    }

    /**
     * Apakah credit sudah habis.
     */
    public function isCreditExhausted(): bool
    {
        return $this->getCreditRemaining() <= 0;
    }
}
