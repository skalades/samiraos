<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasFactory;

    /**
     * Hanya created_at, tanpa updated_at.
     */
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'action_type',
        'entity_type',
        'entity_id',
        'description',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
            'created_at' => 'datetime',
        ];
    }

    // ─── Boot: Auto-set created_at ────────────────────────────

    protected static function booted(): void
    {
        static::creating(function (ActivityLog $log) {
            $log->created_at = $log->created_at ?? now();
        });
    }

    // ─── Relationships ────────────────────────────────────────

    /**
     * User yang melakukan aksi.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ─── Helpers ──────────────────────────────────────────────

    /**
     * Ambil entity terkait (polymorphic manual).
     */
    public function entity(): ?Model
    {
        if (empty($this->entity_type) || empty($this->entity_id)) {
            return null;
        }

        $modelClass = $this->entity_type;

        if (! class_exists($modelClass)) {
            return null;
        }

        return $modelClass::find($this->entity_id);
    }
}
