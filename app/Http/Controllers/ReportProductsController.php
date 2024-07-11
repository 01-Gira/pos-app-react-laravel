<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductLog;

use App\Models\Category;


use App\Models\Purchase;
use App\Models\PurchaseDetail;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Carbon\Carbon;

class ReportProductsController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Reports/Products', [
            'title' => 'Report Products',
            'status' => session('status'),
            'categories' => Category::all()
        ]);
    }

    public function getProducts(Request $request)
    {
        $search = $request->input('search');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $category = $request->input('category');
        $perPage = $request->input('per_page', 5);
        $page = $request->input('page', 1);

        $products = Product::query()
            ->when($search, function ($query, $search) {
                return $query->where('id', 'like', "%{$search}%")
                            ->orWhere('status', 'like', "%{$search}%");
            })
            ->when($startDate, function ($query, $startDate) {
                return $query->whereDate('created_at', '>=', $startDate);
            })
            ->when($endDate, function ($query, $endDate) {
                return $query->whereDate('created_at', '<=', $endDate);
            })
            ->when($category, function ($query, $category) {
                return $query->whereHas('category', function ($query) use ($category) {
                    $query->where('id', $category);
                });
            })
            ->with('category', 'transactionDetails', 'purchaseDetails')
            ->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'products' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'total_pages' => $products->lastPage(),
                'total_items' => $products->total(),
                'per_page' => $products->perPage(),
            ],
            'start_date' => $startDate,
            'end_date' => $endDate,
            'search' => $search,
            'category' => $category
        ]);
    }
}
