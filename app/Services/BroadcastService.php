<?php

namespace App\Services;

use App\Enums\TargetRole;
use App\Models\Announcement;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class BroadcastService
{
    public function __construct(
        private readonly AuditService $auditService,
    ) {}

    /**
     * Publikasikan pengumuman baru.
     *
     * @param  array{
     *     title: string,
     *     body: string,
     *     type: string,
     *     target_role: string,
     *     attachment?: string|null,
     *     is_active?: bool,
     *     expires_at?: string|null
     * } $data
     * @param  User $publisher Admin yang mempublikasikan
     * @return Announcement
     */
    public function publishAnnouncement(array $data, User $publisher): Announcement
    {
        return DB::transaction(function () use ($data, $publisher) {
            $announcement = Announcement::create([
                'title' => $data['title'],
                'body' => $data['body'],
                'type' => $data['type'],
                'target_role' => $data['target_role'],
                'attachment' => $data['attachment'] ?? null,
                'is_active' => $data['is_active'] ?? true,
                'published_by' => $publisher->id,
                'published_at' => now(),
                'expires_at' => $data['expires_at'] ?? null,
            ]);

            $this->auditService->log(
                user: $publisher,
                actionType: \App\Enums\AuditAction::CreateAnnouncement,
                description: "Pengumuman '{$announcement->title}' dipublikasikan",
                entity: $announcement,
                newValues: $announcement->toArray()
            );

            // Broadcast real-time websocket event via Laravel Reverb
            broadcast(new \App\Events\AnnouncementPublished($announcement))->toOthers();

            // Kirim notifikasi asinkron via Queue
            $targetRole = TargetRole::from($data['target_role']);
            \App\Jobs\SendAnnouncementNotifications::dispatch($announcement, $targetRole);

            return $announcement;
        });
    }
}
