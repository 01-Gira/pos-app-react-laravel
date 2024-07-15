<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Notification;
use App\Models\Logs;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;

class NotificationController extends Controller
{
    public function index()
    {
        $perPage = 5;
        $user = Auth::user();

        $page = request()->get('page', 1);

        $notifications = $user->notifications;

        $total = $notifications->count();

        $notifications = $notifications->slice(($page - 1) * $perPage, $perPage);

        $paginator = new LengthAwarePaginator(
            $notifications->forPage($page, $perPage),
            $total,
            $perPage,
            $page
        );


        $notifications = $paginator->items();

        return Inertia::render('Notification/Index', [
            'title' => 'Notifications',
            'status' => session('status'),
        ]);
    }

    public function update(Notification $notification)
    {
        $notification->read_at = Carbon::now();
        $notification->update();

        return redirect()->back();
    }

    public function markAsReadAll()
    {
        try {
            $user = Auth::user();
            foreach ($user->unreadNotifications as $notification) {
                $data['fileName'] = $notification->data;
                $data['fileName'] = null;
                $notification->update(['data' => $data]);
                $notification->markAsRead();
            }

            return redirect()->back();
        } catch (\Throwable $th) {
            throw $th;
        }

    }

}
