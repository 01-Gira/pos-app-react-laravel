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
                return $query->where('category_name', 'like', "%{$search}%");
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

            $validated = $request->validate([
                'category_name' => 'required|string|max:255',
            ]);
            // dd($request->all());
            $category = Category::create([
                'category_name' => $validated['category_name'],
            ]);

            DB::connection('pgsql')->commit();

            $logs->insertLog('Category.store : Successfully create category');

            return Redirect::back()->with([
                'type_message' => 'success',
                'message' => 'Successfully create category'
            ]);
        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return Redirect::back()->with([
                'type_message' => 'warning',
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

            $validated = $request->validate([
                'category_name' => 'required|string|max:255',
            ]);

            $category->update([
                'category_name' => $validated['category_name']
            ]);

            DB::connection('pgsql')->commit();

            return Redirect::back()->with([
                'type_message' => 'success',
                'message' => 'Category updated successfully', 201
            ]);

        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return Redirect::back()->with([
                'type_message' => 'warning',
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
                'type_message' => 'success',
                'message' => 'Successfully delete category'
            ]);

        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return Redirect::back()->with([
                'type_message' => 'warning',
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

            Excel::import(new CategoryImport, $file);

            DB::connection('pgsql')->commit();

            return response()->json([
                'indctr' => 1,
                'message' => 'Succesfully import data categories'
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
