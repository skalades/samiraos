<?php

namespace App\Http\Controllers;

use App\Models\Territory;
use App\Models\User;
use App\Models\NetworkBinding;
use App\Enums\UserRole;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TerritoryController extends Controller
{
    public function __construct(
        private readonly AuditService $auditService,
    ) {}

    /**
     * Daftar wilayah dengan peta.
     */
    public function index(Request $request): Response
    {
        $territories = Territory::with(['networkBindings' => function ($q) {
            $q->where('role', 'distributor');
        }, 'networkBindings.user'])
            ->where('is_active', true)
            ->get()
            ->map(function (Territory $territory) {
                $distributor = $territory->networkBindings->first();
                return [
                    'id' => $territory->id,
                    'name' => $territory->name,
                    'slug' => $territory->slug,
                    'latitude' => $territory->latitude,
                    'longitude' => $territory->longitude,
                    'max_stock_capacity' => $territory->max_stock_capacity,
                    'is_active' => $territory->is_active,
                    'distributor' => $distributor?->user?->only('id', 'name', 'phone'),
                ];
            });

        return Inertia::render('Territories/Index', [
            'territories' => $territories,
        ]);
    }

    /**
     * Update territory data.
     */
    public function update(Request $request, Territory $territory): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'max_stock_capacity' => 'required|integer|min:100',
        ]);

        $oldValues = $territory->toArray();

        $territory->update($request->only('name', 'latitude', 'longitude', 'max_stock_capacity'));

        $this->auditService->log(
            user: $request->user(),
            actionType: \App\Enums\AuditAction::UpdateTerritory,
            description: "Mengubah data wilayah: {$territory->name}",
            entity: $territory,
            oldValues: $oldValues,
            newValues: $territory->fresh()->toArray(),
        );

        return back()->with('success', 'Wilayah berhasil diperbarui.');
    }
}
