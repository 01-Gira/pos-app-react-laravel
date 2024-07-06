<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Store;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated['user'] = $request->validate([
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $request->merge([
            'phone_no' => preg_replace('/^0/', '+62', $request->input('phone_no')),
        ]);

        $validated['store'] = $request->validate([
            'store_name' => 'required|string|max:255|:unique:'.Store::class,
            'phone_no' => 'required|min:12|max:14',
            'address' => 'max:255',
        ]);

        $user = User::create($validated['user']);

        event(new Registered($user));

        Auth::login($user);

        $validated['store']['user_id'] = Auth::id();

        Store::create($validated['store']);

        return redirect(route('dashboard'));
    }
}
