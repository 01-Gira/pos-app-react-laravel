<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Models\Logs;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $startDate = $request->input('start_date');
        $startDate = empty($startDate) ? Carbon::now()->firstOfMonth()->format('Y-m-d') : $startDate;
        $endDate = $request->input('end_date');
        $endDate = empty($endDate) ? Carbon::now()->endOfMonth()->format('Y-m-d') : $endDate;
        $search = $request->input('search');
        $perPage = $request->input('per_page', 5);

        $suppliers = Supplier::query()
            ->when($search, function ($query, $search) {
                return $query->where('supplier_name', 'like', "%{$search}%")
                             ->orWhere('uniq_code', 'like', "%{$search}%");
            })
            ->when($startDate, function ($query, $startDate) {
                return $query->whereDate('created_at', '>=', $startDate);
            })
            ->when($endDate, function ($query, $endDate) {
                return $query->whereDate('created_at', '<=', $endDate);
            })
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return Inertia::render('Supplier/Index', [
            'title' => 'Suppliers',
            'status' => session('status'),
            'suppliers' => $suppliers->items(),
            'pagination' => [
                'current_page' => $suppliers->currentPage(),
                'total_pages' => $suppliers->lastPage(),
                'total_items' => $suppliers->total(),
                'per_page' => $suppliers->perPage(),
            ],
            'search' => $search,
            'start_date' => $startDate,
            'end_date' => $endDate
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Supplier/Create', [
            'title' => 'Add Supplier',
            'status' => session('status'),
        ]);
    }

        /**
     * Get data from database.
     */
    public function getDataSupplier($uniq_code)
    {
        $supplier = Supplier::where('uniq_code', $uniq_code)->first();

        return response()->json([
            'status' => 'OK',
            'supplier' => $supplier
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $logs = new Logs();

            DB::connection('pgsql')->beginTransaction();

            $validated = $request->validate([
                'uniq_code' => 'required|string|max:225',
                'phone_no' => 'required|min:12|max:14',
                'supplier_name' => 'required|max:255',
                'address' => 'required|max:255'
            ]);

            Supplier::updateOrCreate(
                ['uniq_code' => $validated['uniq_code']],
                $validated
            );

            DB::connection('pgsql')->commit();

            $logs->insertLog('Supplier.store : Successfully create supplier');

            return to_route('master.suppliers.index')->with([
                'type_message' => 'success',
                'message' => 'Successfully create supplier'
            ]);

        } catch (\Throwable $th) {

            DB::connection('pgsql')->rollback();

            return to_route('master.suppliers.index')->with([
                'type_message' => 'warning',
                'message' => 'Oops Something Went Wrong! Message : ' . $th->getMessage()
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Supplier $supplier)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Supplier $supplier)
    {
        return Inertia::render('Supplier/Edit', [
            'title' => 'Edit Supplier ' . $supplier->uniq_code,
            'status' => session('status'),
            'supplier' => $supplier
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Supplier $supplier)
    {
        try {
            $logs = new Logs();

            DB::connection('pgsql')->beginTransaction();

            $validated = $request->validate([
                'supplier_name' => 'required|max:255',
                'address' => 'required|max:255'
            ]);

            $supplier->update($validated);

            DB::connection('pgsql')->commit();

            $logs->insertLog('Supplier.update : Successfully update supplier');

            return to_route('master.suppliers.index')->with([
                'type_message' => 'success',
                'message' => 'Successfully update supplier'
            ]);

        } catch (\Throwable $th) {
             DB::connection('pgsql')->rollback();

            return to_route('master.suppliers.index')->with([
                'type_message' => 'warning',
                'message' => 'Oops Something Went Wrong! Message : ' . $th->getMessage()
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier)
    {
        try {
            $logs = new Logs();

            DB::connection('pgsql')->beginTransaction();

            $supplier->delete();

            DB::connection('pgsql')->commit();

            $logs->insertLog('Supplier.delete : Successfully delete supplier');

            return to_route('master.suppliers.index')->with([
                'type_message' => 'success',
                'message' => 'Supplier deleted successfully'
            ]);
        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return to_route('master.suppliers.index')->with([
                'type_message' => 'warning',
                'message' => 'Oops Something Went Wrong! Message : ' . $th->getMessage()
            ]);
        }
    }
}
