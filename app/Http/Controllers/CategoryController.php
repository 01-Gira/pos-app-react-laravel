<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Logs;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\RedirectResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Imports\CategoryImport;
use App\Exports\CategoriesExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $startDate = $request->input('start_date');
        $startDate = empty($startDate) ? Carbon::now()->firstOfMonth()->format('Y-m-d') : $startDate;
        $endDate = $request->input('end_date');
        $endDate = empty($endDate) ? Carbon::now()->endOfMonth()->format('Y-m-d') : $endDate;
        $perPage = $request->input('per_page', 5);

        $categories = Category::query()
            ->when($search, function ($query, $search) {
                $search = strtolower($search);
                return $query->whereRaw('LOWER(category_name) LIKE ?', ["%{$search}%"]);
            })
            ->when($startDate, function ($query, $startDate) {
                return $query->whereDate('created_at', '>=', $startDate);
            })
            ->when($endDate, function ($query, $endDate) {
                return $query->whereDate('created_at', '<=', $endDate);
            })
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return Inertia::render('Category/Index', [
            'title' => 'Master Categories',
            'status' => session('status'),
            'categories' => $categories->items(),
            'pagination' => [
                'current_page' => $categories->currentPage(),
                'total_pages' => $categories->lastPage(),
                'total_items' => $categories->total(),
                'per_page' => $categories->perPage(),
            ],
            'search' => $search,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request) : RedirectResponse
    {
        try {
            $logs = new Logs();

            DB::connection('pgsql')->beginTransaction();

            // Simpan nilai asli
            $originalCategoryName = $request->input('category_name');

            // Ubah nilai menjadi huruf kecil untuk validasi
            $request->merge(['category_name' => Str::lower($originalCategoryName)]);

            // Validasi permintaan
            $validated = $request->validate([
                'category_name' => 'required|string|max:255|unique:categories,category_name',
            ]);

            // Kembalikan nilai asli setelah validasi berhasil
            $validated['category_name'] = $originalCategoryName;

            // Buat kategori dengan nilai asli
            $category = Category::create([
                'category_name' => $validated['category_name'],
            ]);


            DB::connection('pgsql')->commit();

            $logs->insertLog('Category.store : Successfully create category');

            return Redirect::back()->with([
                'title' => 'Success',
                'type_message' => 'success',
                'message' => 'Successfully create category'
            ]);
        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return Redirect::back()->with([
                'title' => 'Error',
                'type_message' => 'error',
                'message' => 'Oops Something Went Wrong! Message : ' . $th->getMessage()
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        try {
            $logs = new Logs();

            DB::connection('pgsql')->beginTransaction();

            $originalCategoryName = $request->input('category_name');

            // Ubah nilai menjadi huruf kecil untuk validasi
            $request->merge(['category_name' => Str::lower($originalCategoryName)]);

            // Validasi permintaan
            $validated = $request->validate([
                'category_name' => 'required|string|max:255|unique:categories,category_name,' . $category->id,
            ]);

            // Kembalikan nilai asli setelah validasi berhasil
            $validated['category_name'] = $originalCategoryName;

            $category->update([
                'category_name' => $validated['category_name']
            ]);

            DB::connection('pgsql')->commit();

            return Redirect::back()->with([
                'title' => 'Success',
                'type_message' => 'success',
                'message' => 'Category updated successfully'
            ]);

        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return Redirect::back()->with([
                'title' => 'Error',
                'type_message' => 'error',
                'message' => 'Oops Something Went Wrong! Message : ' . $th->getMessage()
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        try {
            $logs = new Logs();

            DB::connection('pgsql')->beginTransaction();

            $category->delete();

            DB::connection('pgsql')->commit();

            $logs->insertLog('Category.delete : Successfully delete category');

            return Redirect::back()->with([
                'title' => 'Success',
                'type_message' => 'success',
                'message' => 'Successfully delete category'
            ]);

        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return Redirect::back()->with([
                'title' => 'Error',
                'type_message' => 'error',
                'message' => 'Oops Something Went Wrong! Message : ' . $th->getMessage()
            ]);
        }
    }

    public function importData(Request $request)
    {
        try {
            $logs = new Logs();

            DB::connection('pgsql')->beginTransaction();

            $validated = $request->validate([
                'file' => 'required|file|mimes:xlsx'
            ]);

            $file = $validated['file'];

            $import = new CategoryImport();
            $import->import($file);


            $failures = $import->failures();
            $failureMessages = [];


            foreach ($failures as $failure) {
                $failureMessages[] = [
                    'row' => $failure->row(),
                    'attribute' => $failure->attribute(),
                    'errors' => $failure->errors(),
                    'values' => $failure->values()
                ];
            }

            // Excel::import(new CategoryImport, $file);

            DB::connection('pgsql')->commit();

            return response()->json([
                'indctr' => 1,
                'message' => 'Succesfully import data categories',
                'failures' => $failureMessages
            ]);

        } catch (\Throwable $th) {
            DB::connection('pgsql')->commit();

            return response()->json([
                'indctr' => 0,
                'message' => 'Oops Something Went Wrong! Message : ' . $th->getMessage()
            ]);
        }
    }

    public function exportData()
    {
        if(Auth::check()){

            return Excel::download(new CategoriesExport, 'categories.xlsx');
        }else{
            return redirect()->route('/login');
        }
    }
}
