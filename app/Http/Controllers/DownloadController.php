<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class DownloadController extends Controller
{
    public function download(Request $request)
    {
        $id = $request->get('id');
        $fileName = $request->get('fileName');

        $path = public_path('storage/exports/' . $fileName);

        if (!file_exists($path)) {
            return abort(404, 'File not found');
        }

        $response = new StreamedResponse(function () use ($path) {
            $stream = fopen($path, 'r');
            while (!feof($stream)) {
                echo fread($stream, 1024 * 8);
                ob_flush();
                flush();
            }
            fclose($stream);
        });

        $user = Auth::user();
        $notification = $user->notifications()->find($id);

        $data = $notification->data;
        $data['fileName'] = null;
        $notification->update(['data' => $data]);
        $notification->markAsRead();

        $response->headers->set('Content-Type', mime_content_type($path));
        $response->headers->set('Content-Disposition', 'attachment; filename="' . basename($path) . '"');
        $response->headers->set('Content-Length', filesize($path));

        $response->send();

        unlink($path);

        return $response;
    }
}
