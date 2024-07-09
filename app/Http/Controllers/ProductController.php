<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Discount;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Carbon\Carbon;

class ProductController extends Controller
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
        $status = $request->input('status');
        $perPage = $request->input('per_page', 5);

        $products = Product::query()
            ->when($search, function ($query, $search) {
                return $query->where('product_name', 'like', "%{$search}%")
                             ->orWhere('barcode', 'like', "%{$search}%");
            })
            ->when($startDate, function ($query, $startDate) {
                return $query->whereDate('created_at', '>=', $startDate);
            })
            ->when($endDate, function ($query, $endDate) {
                return $query->whereDate('created_at', '<=', $endDate);
            })
            ->when($status, function ($query, $status) {
                return $query->where('category_id', $status);
            })
            ->with('category', 'discount')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return Inertia::render('Product/Index', [
            'title' => 'Master Products',
            'status' => session('status'),
            'products' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'total_pages' => $products->lastPage(),
                'total_items' => $products->total(),
                'per_page' => $products->perPage(),
            ],
            'search' => $search,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => $status,
            'categories' => Category::all()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Product/Create', [
            'title' => 'Add Product',
            'status' => session('status'),
            'categories' => Category::all()
        ]);
    }

    /**
     * Get data from database.
     */
    public function getDataProduct($barcode)
    {
        $product = Product::where('barcode', $barcode)->with('category')->first();

        if ($product) {
            $discount = Discount::select('discount')->where('product_id', $product->id)->first();
            $product->quantity = 1;
            $product->discount = $discount ? $discount->discount : 0;
            $path = $product->picture ? storage_path('app/public/' . $product->picture) : null;

            if (file_exists($path)) {
                $fileExtension = pathinfo($path, PATHINFO_EXTENSION);
                $imageData = file_get_contents($path);
                $base64 = 'data:image/' . $fileExtension . ';base64,' . base64_encode($imageData);

                $product->pictureBase64 = $base64;
            }

            return response()->json([
                'status' => 'OK',
                'product' => $product
            ]);
        }
    }



    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'barcode' => 'required|string|max:12|min:12',
            'product_name' => 'required|string|max:225',
            'category_id' => 'required|uuid',
            'stock' => 'required|numeric',
            'price' => 'required|numeric',
            'picture' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $product = Product::where('barcode', $validated['barcode'])->first();

        if ($request->hasFile('picture')) {

            if ($product && $product->picture) {
                Storage::disk('public')->delete($product->picture);
            }

            $picture = $request->file('picture');

            $path = $picture->store('product_images', 'public'); // Store image in public storage under product_images directory

            $validated['picture'] = $path;
        }else {
            if ($product && $product->picture) {
                $validated['picture'] = $product->picture;
            }
        }

        Product::updateOrCreate(
            ['barcode' => $validated['barcode']],
            $validated
        );

        return to_route('master.products.index')->with([
            'type_message' => 'success',
            'message' => 'Product created successfully', 201
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $path = $product->picture ? storage_path('app/public/' . $product->picture) : null;

        if (file_exists($path)) {
            $fileExtension = pathinfo($path, PATHINFO_EXTENSION);
            $imageData = file_get_contents($path);
            $base64 = 'data:image/' . $fileExtension . ';base64,' . base64_encode($imageData);

            $product->pictureBase64 = $base64;
        }

        return Inertia::render('Product/Edit', [
            'title' => 'Edit Product ' . $product->barcode,
            'status' => session('status'),
            'categories' => Category::all(),
            'product' => $product
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'barcode' => 'required|string|max:225',
            'product_name' => 'required|string|max:225',
            'category_id' => 'required|uuid',
            'stock' => 'required|numeric',
            'price' => 'required|numeric',
            'picture' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($request->hasFile('picture')) {
            if ($product->picture) {
                Storage::disk('public')->delete($product->picture);
            }
            $picture = $request->file('picture');
            $path = $picture->store('product_images', 'public'); // Store image in public storage under product_images directory
            $validated['picture'] = $path;
        }else {
            $product = Product::where('barcode', $validated['barcode'])->first();
            if ($product && $product->picture) {
                $validated['picture'] = $product->picture;
            }
        }

        $product->update($validated);

        return to_route('master.products.index')->with([
            'type_message' => 'success',
            'message' => 'Product updated successfully', 201
        ]);

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return to_route('master.products.index')->with([
            'type_message' => 'success',
            'message' => 'Product deleted successfully', 201
        ]);
    }

    /**
     * Add discount to product.
     */
    public function addDiscountProduct(Request $request, $product_id)
    {
        $validated = $request->validate([
            'discount' => 'required'
        ]);

        Discount::updateOrCreate(
            ['product_id' => $product_id],
            [
                'discount' => $validated['discount'
            ]
        ]);

        return to_route('master.products.index')->with([
            'type_message' => 'success',
            'message' => 'Add discount to product successfully', 201
        ]);
    }
}
