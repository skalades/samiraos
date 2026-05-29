<?php

namespace App\Events;

use App\Models\Announcement;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AnnouncementPublished implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public readonly Announcement $announcement
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $target = $this->announcement->target_role->value;

        if ($target === 'all') {
            return [
                new PrivateChannel('announcements.all'),
            ];
        }

        return [
            new PrivateChannel("announcements.{$target}"),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->announcement->id,
            'title' => $this->announcement->title,
            'body' => $this->announcement->body,
            'type' => $this->announcement->type->value,
            'target_role' => $this->announcement->target_role->value,
            'published_at' => $this->announcement->published_at ? $this->announcement->published_at->toIso8601String() : now()->toIso8601String(),
        ];
    }
}
