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
    public function version(Request $request): string|null
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
        $user = $request->user();

        $notifications = [];
        if ($user) {
            $user->load('store');
            $notifications = $user->unreadNotifications;
        }


        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user,
            ],
            'notifications' => $notifications,
            'flash' => [
                'title'  => fn () => $request->session()->get('title'),
                'type_message' => fn () => $request->session()->get('type_message'),
                'message' => fn () => $request->session()->get('message')
            ],
        ]);
    }
}
