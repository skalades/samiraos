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
                actionType: 'announcement_published',
                description: "Pengumuman '{$announcement->title}' dipublikasikan",
                entity: $announcement,
                newValues: $announcement->toArray()
            );

            // Broadcast real-time websocket event via Laravel Reverb
            broadcast(new \App\Events\AnnouncementPublished($announcement))->toOthers();

            // Kirim notifikasi database berdasarkan target role
            $targetRole = TargetRole::from($data['target_role']);
            if ($targetRole === TargetRole::All) {
                $this->sendToAll($announcement);
            } else {
                $this->sendToRole($announcement, $targetRole);
            }

            return $announcement;
        });
    }

    /**
     * Broadcast pengumuman ke semua user.
     *
     * @param  Announcement $announcement
     * @return void
     */
    public function sendToAll(Announcement $announcement): void
    {
        User::where('is_active', true)
            ->where('id', '!=', $announcement->published_by)
            ->chunk(100, function ($users) use ($announcement) {
                foreach ($users as $user) {
                    $user->notify(new \App\Notifications\NewAnnouncement($announcement));
                }
            });
    }

    /**
     * Broadcast pengumuman ke role tertentu.
     *
     * @param  Announcement $announcement
     * @param  TargetRole   $role
     * @return void
     */
    public function sendToRole(Announcement $announcement, TargetRole $role): void
    {
        User::where('is_active', true)
            ->where('role', $role->value)
            ->chunk(100, function ($users) use ($announcement) {
                foreach ($users as $user) {
                    $user->notify(new \App\Notifications\NewAnnouncement($announcement));
                }
            });
    }
}
