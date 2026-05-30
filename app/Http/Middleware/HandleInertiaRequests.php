<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role?->value,
                    'avatar' => $request->user()->avatar,
                    'phone' => $request->user()->phone,
                ] : null,
                'permissions' => $request->user() ? [
                    'manage_users' => $request->user()->can('manage-users'),
                    'manage_products' => $request->user()->can('manage-products'),
                    'manage_announcements' => $request->user()->can('manage-announcements'),
                    'manage_bank_accounts' => $request->user()->can('manage-bank-accounts'),
                    'view_all_data' => $request->user()->can('view-all-data'),
                    'view_central_receivables' => $request->user()->can('view-central-receivables'),
                    'approve_receivable_payments' => $request->user()->can('approve-receivable-payments'),
                    'order_with_credit' => $request->user()->can('order-with-credit'),
                ] : [],
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'notifications' => [
                'unread_count' => fn () => $request->user()
                    ? $request->user()->unreadNotifications()->count()
                    : 0,
            ],
        ];
    }
}
