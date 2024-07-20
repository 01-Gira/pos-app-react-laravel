<?php

namespace App\Http\Controllers;

use App\Models\ClaimToSupplier;
use App\Models\Logs;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Exception;
use Illuminate\Support\Str;

use App\Exports\ClaimCustomerExport;
use App\Jobs\NotifyUserOfCompletedExport;

class ClaimToSupplierController extends Controller
{
    public function index(Request $request)
    {
        $start_date = $request->input('start_date') ? $request->input('start_date') : Carbon::now()->firstOfMonth()->format('Y-m-d') ;
        $end_date = $request->input('end_date') ? $request->input('end_date') : Carbon::now()->endOfMonth()->format('Y-m-d') ;

        $filters = [
            'search' => $request->input('search'),
            'start_date' => $start_date,
            'end_date' => $end_date,
            'status' => $request->input('status'),
        ];

        $perPage = $request->input('per_page', 5);

        $claimsuppliers = ClaimToSupplier::filter($filters)
            ->paginate($perPage);

        return Inertia::render('ClaimSupplier/Index', [
            'title' => 'Claim To Suppliers',
            'status' => session('status'),
            'claimsuppliers' => $claimsuppliers->items(),
            'pagination' => [
                'current_page' => $claimsuppliers->currentPage(),
                'total_pages' => $claimsuppliers->lastPage(),
                'total_items' => $claimsuppliers->total(),
                'per_page' => $claimsuppliers->perPage(),
            ],
            'start_date' => $filters['start_date'],
            'end_date' => $filters['end_date'],
            'status' => $filters['status'],
        ]);
    }

    public function create()
    {
        return Inertia::render('ClaimSupplier/Create', [
            'title' => 'Add Claim Customer',
            'status' => session('status')
        ]);
    }

    public function verifyPurchase($purchase_id)
    {
        $indctr = 0;
        $msg = 'Purchase is not exist';

        if (!Str::isUuid($Purchase_id)) {
            return response()->json(['indctr' => $indctr, 'message' => 'Invalid Purchase ID']);
        }

        try {
            $Purchase = Purchase::findOrFail($Purchase_id);
            $indctr = 1;
            $msg = 'Purchase is exist';
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            $indctr = 0;
            $msg = 'Purchase is not exist';
        }

        return response()->json(['indctr' => $indctr, 'message' => $msg]);
    }
}
