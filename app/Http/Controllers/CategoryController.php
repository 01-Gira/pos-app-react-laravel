<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\RedirectResponse;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('per_page', 5);

        $categories = Category::query()
            ->when($search, function ($query, $search) {
                return $query->where('category_name', 'like', "%{$search}%");
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
        $validated = $request->validate([
            'category_name' => 'required|string|max:255',
        ]);
        // dd($request->all());
        $category = Category::create([
            'category_name' => $validated['category_name'],
        ]);

        return Redirect::back()->with([
            'type_message' => 'success',
            'message' => 'Category created successfully', 201
        ]);
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
        $validated = $request->validate([
            'category_name' => 'required|string|max:255',
        ]);

        $category->update([
            'category_name' => $validated['category_name']
        ]);

        return Redirect::back()->with([
            'type_message' => 'success',
            'message' => 'Category updated successfully', 201
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();

        return Redirect::back()->with([
            'type_message' => 'success',
            'message' => 'Category deleted successfully'

        ]);
    }
}
