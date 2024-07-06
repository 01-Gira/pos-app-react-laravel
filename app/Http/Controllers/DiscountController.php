<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Discount;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
class DiscountController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('per_page', 5);

        $discounts = Discount::query()
            ->when($search, function ($query, $search) {
                return $query->where('product_name', 'like', "%{$search}%")
                                ->orWhere('barcode', 'like', "%{$search}%");
            })
            ->with('product')
            ->orderByDesc('created_at')
            ->paginate($perPage);
            // dd($discounts);
        return Inertia::render('Discount/Index', [
            'title' => 'Master Discounts',
            'status' => session('status'),
            'discounts' => $discounts->items(),
            'pagination' => [
                'current_page' => $discounts->currentPage(),
                'total_pages' => $discounts->lastPage(),
                'total_items' => $discounts->total(),
                'per_page' => $discounts->perPage(),
            ],
            'search' => $search,
        ]);
    }
}
