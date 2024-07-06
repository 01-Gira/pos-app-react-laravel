<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('per_page', 5);

        $suppliers = Supplier::query()
            ->when($search, function ($query, $search) {
                return $query->where('supplier_name', 'like', "%{$search}%")
                             ->orWhere('uniq_code', 'like', "%{$search}%");
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
        $validated = $request->validate([
            'uniq_code' => 'required|string|max:225',
            'supplier_name' => 'required|max:255',
            'address' => 'required|max:255'
        ]);

        Supplier::updateOrCreate(
            ['uniq_code' => $validated['uniq_code']],
            $validated
        );

        return to_route('master.suppliers.index')->with([
            'type_message' => 'success',
            'message' => 'Supplier created successfully', 201
        ]);
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
        $validated = $request->validate([
            'supplier_name' => 'required|max:255',
            'address' => 'required|max:255'
        ]);

        $supplier->update($validated);

        return to_route('master.suppliers.index')->with([
            'type_message' => 'success',
            'message' => 'Supplier updated successfully', 201
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier)
    {
        $supplier->delete();

        return to_route('master.suppliers.index')->with([
            'type_message' => 'success',
            'message' => 'Supplier deleted successfully', 201
        ]);
    }
}
