<?php

namespace App\Http\Controllers;

use App\Enums\AnnouncementType;
use App\Enums\TargetRole;
use App\Models\Announcement;
use App\Services\BroadcastService;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Requests\StoreAnnouncementRequest;
use Illuminate\Support\Facades\Gate;

class AnnouncementController extends Controller
{
    public function __construct(
        private readonly BroadcastService $broadcastService,
        private readonly AuditService $auditService,
    ) {}

    /**
     * Daftar pengumuman.
     */
    public function index(Request $request): Response
    {
        $announcements = Announcement::with('publisher')
            ->latest('published_at')
            ->paginate(15);

        return Inertia::render('Announcements/Index', [
            'announcements' => $announcements,
        ]);
    }

    /**
     * Form buat pengumuman.
     */
    public function create(): Response
    {
        Gate::authorize('manage-announcements');
        
        return Inertia::render('Announcements/Create', [
            'types' => collect(AnnouncementType::cases())->map(fn($t) => ['value' => $t->value, 'label' => ucfirst($t->value)]),
            'targetRoles' => collect(TargetRole::cases())->map(fn($r) => ['value' => $r->value, 'label' => ucfirst($r->value)]),
        ]);
    }

    /**
     * Simpan & broadcast pengumuman.
     */
    public function store(StoreAnnouncementRequest $request): RedirectResponse
    {
        Gate::authorize('manage-announcements');

        try {
            $attachmentPath = null;
            if ($request->hasFile('attachment')) {
                $attachmentPath = $request->file('attachment')->store('announcements', 'public');
            }

            $announcement = $this->broadcastService->publishAnnouncement([
                'title' => $request->title,
                'body' => $request->body,
                'type' => $request->type,
                'target_role' => $request->target_role,
                'attachment' => $attachmentPath,
                'expires_at' => $request->expires_at,
            ], $request->user());


            return redirect()->route('announcements.index')
                ->with('success', 'Pengumuman berhasil dipublikasikan.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Hapus pengumuman.
     */
    public function destroy(Request $request, Announcement $announcement): RedirectResponse
    {
        Gate::authorize('manage-announcements');

        $this->auditService->log(
            user: $request->user(),
            actionType: \App\Enums\AuditAction::DeleteAnnouncement,
            description: "Menghapus pengumuman: {$announcement->title}",
            entity: $announcement,
        );

        $announcement->update(['is_active' => false]);

        return redirect()->route('announcements.index')
            ->with('success', 'Pengumuman berhasil dihapus.');
    }
}
