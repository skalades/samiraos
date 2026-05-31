<?php

namespace App\Models;

use App\Enums\AnnouncementType;
use App\Enums\TargetRole;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'body',
        'type',
        'target_role',
        'attachment',
        'is_active',
        'published_by',
        'published_at',
        'expires_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => AnnouncementType::class,
            'target_role' => TargetRole::class,
            'is_active' => 'boolean',
            'published_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    // ─── Relationships ────────────────────────────────────────

    /**
     * Admin yang mempublikasikan pengumuman.
     */
    public function publisher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }

    // ─── Scopes ───────────────────────────────────────────────

    /**
     * Scope: hanya pengumuman yang aktif dan belum expired.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query
            ->where('is_active', true)
            ->where(function (Builder $q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    /**
     * Scope: filter berdasarkan target role.
     * Termasuk pengumuman untuk 'all'.
     */
    public function scopeForRole(Builder $query, string $role): Builder
    {
        return $query->where(function (Builder $q) use ($role) {
            $q->where('target_role', TargetRole::All->value)
                ->orWhere('target_role', $role);
        });
    }

    // ─── Helpers ──────────────────────────────────────────────

    /**
     * Apakah pengumuman sudah expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }
}
