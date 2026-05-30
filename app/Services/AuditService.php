<?php

namespace App\Services;

use App\Enums\AuditAction;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Request;

class AuditService
{
    /**
     * Catat aktivitas user ke activity_logs.
     *
     * @param  User        $user       User yang melakukan aksi
     * @param  AuditAction $actionType Tipe aksi (e.g. 'order_created', 'stock_added')
     * @param  string      $description Deskripsi aksi
     * @param  Model|null  $entity     Entity yang terkait (polymorphic)
     * @param  array|null  $oldValues  Nilai lama sebelum perubahan
     * @param  array|null  $newValues  Nilai baru setelah perubahan
     * @return ActivityLog
     */
    public function log(
        User $user,
        AuditAction $actionType,
        string $description,
        ?Model $entity = null,
        ?array $oldValues = null,
        ?array $newValues = null
    ): ActivityLog {
        return ActivityLog::create([
            'user_id' => $user->id,
            'action_type' => $actionType->value,
            'entity_type' => $entity ? get_class($entity) : null,
            'entity_id' => $entity?->getKey(),
            'description' => $description,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => static::getClientIp(),
            'user_agent' => static::getUserAgent(),
        ]);
    }

    /**
     * Ambil IP address client dari request.
     */
    public static function getClientIp(): ?string
    {
        try {
            return Request::ip();
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Ambil user agent dari request.
     */
    public static function getUserAgent(): ?string
    {
        try {
            return Request::userAgent();
        } catch (\Throwable) {
            return null;
        }
    }
}
