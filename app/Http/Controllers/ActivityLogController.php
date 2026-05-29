<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Enums\UserRole;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Daftar audit trail.
     * Super Admin: lihat semua log
     * Distributor: lihat log internal sendiri
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = ActivityLog::with('user');

        // Filter berdasarkan role
        if ($user->role !== UserRole::SuperAdmin) {
            $query->where('user_id', $user->id);
        }

        // Filter action type
        if ($request->has('action_type') && $request->action_type) {
            $query->where('action_type', $request->action_type);
        }

        // Filter tanggal
        if ($request->has('date_from') && $request->date_from) {
            $query->where('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->where('created_at', '<=', $request->date_to . ' 23:59:59');
        }

        // Search
        if ($request->has('search') && $request->search) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        $logs = $query->latest('created_at')->paginate(25)->withQueryString();

        // Daftar tipe aksi unik untuk filter
        $actionTypes = ActivityLog::when(
            $user->role !== UserRole::SuperAdmin,
            fn($q) => $q->where('user_id', $user->id)
        )->distinct()->pluck('action_type');

        return Inertia::render('ActivityLogs/Index', [
            'logs' => $logs,
            'actionTypes' => $actionTypes,
            'filters' => $request->only(['action_type', 'date_from', 'date_to', 'search']),
        ]);
    }
}
