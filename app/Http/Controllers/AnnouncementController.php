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
        return Inertia::render('Announcements/Create', [
            'types' => collect(AnnouncementType::cases())->map(fn($t) => ['value' => $t->value, 'label' => ucfirst($t->value)]),
            'targetRoles' => collect(TargetRole::cases())->map(fn($r) => ['value' => $r->value, 'label' => ucfirst($r->value)]),
        ]);
    }

    /**
     * Simpan & broadcast pengumuman.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'title' => 'required|string|max:200',
            'body' => 'required|string|max:5000',
            'type' => 'required|in:info,warning,promo,urgent',
            'target_role' => 'required|in:all,distributor,agen',
            'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'expires_at' => 'nullable|date|after:now',
        ]);

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

            $this->auditService->log(
                user: $request->user(),
                actionType: 'CREATE_ANNOUNCEMENT',
                description: "Membuat pengumuman: {$announcement->title} (target: {$request->target_role})",
                entity: $announcement,
            );

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
        $this->auditService->log(
            user: $request->user(),
            actionType: 'DELETE_ANNOUNCEMENT',
            description: "Menghapus pengumuman: {$announcement->title}",
            entity: $announcement,
        );

        $announcement->update(['is_active' => false]);

        return redirect()->route('announcements.index')
            ->with('success', 'Pengumuman berhasil dihapus.');
    }
}
