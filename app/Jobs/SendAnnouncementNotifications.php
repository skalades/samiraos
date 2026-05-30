<?php

namespace App\Jobs;

use App\Models\Announcement;
use App\Models\User;
use App\Enums\TargetRole;
use App\Notifications\NewAnnouncement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendAnnouncementNotifications implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Announcement $announcement,
        public TargetRole $role
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $query = User::where('is_active', true)
            ->where('id', '!=', $this->announcement->published_by);

        if ($this->role !== TargetRole::All) {
            $query->where('role', $this->role->value);
        }

        $query->chunk(100, function ($users) {
            foreach ($users as $user) {
                $user->notify(new NewAnnouncement($this->announcement));
            }
        });
    }
}
