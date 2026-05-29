<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'territories' => \App\Models\Territory::where('is_active', true)->get(['id', 'name']),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'territory_id' => 'required|exists:territories,id',
        ]);

        // Find the active distributor in this territory to be the parent
        $distributorBinding = \App\Models\NetworkBinding::where('territory_id', $request->territory_id)
            ->where('role', 'distributor')
            ->first();

        if (!$distributorBinding) {
            throw ValidationException::withMessages([
                'territory_id' => 'Mohon maaf, belum ada Distributor resmi yang aktif di wilayah ini. Pendaftaran agen tidak dapat dilanjutkan.',
            ]);
        }

        return \Illuminate\Support\Facades\DB::transaction(function () use ($request, $distributorBinding) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => \App\Enums\UserRole::Agen,
            ]);

            \App\Models\NetworkBinding::create([
                'user_id' => $user->id,
                'role' => 'agen',
                'territory_id' => $request->territory_id,
                'parent_id' => $distributorBinding->user_id,
            ]);

            event(new Registered($user));

            Auth::login($user);

            return redirect(route('dashboard', absolute: false));
        });
    }
}
