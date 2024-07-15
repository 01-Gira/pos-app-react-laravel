<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Discount;
use App\Models\Category;
use App\Models\Logs;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Imports\ProductsImport;
use App\Exports\ProductsExport;
use Maatwebsite\Excel\Facades\Excel;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filters = [
            'search' => $request->input('search'),
            'category' => $request->input('category')
        ];

        $perPage = $request->input('per_page', 5);

        $products = Product::filter($filters)
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
            'search' => $filters['search'],
            'category' => $filters['category'],
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
        try {
            $logs = new Logs();

            DB::connection('pgsql')->beginTransaction();

            $validated = $request->validate([
                'barcode' => 'required|numeric|min:12|max:13',
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

            DB::connection('pgsql')->commit();

            $logs->insertLog('Product.store : Successfully store data');

            return to_route('master.products.index')->with([
                'type_message' => 'success',
                'message' => 'Successfully store data product'
            ]);

        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return to_route('master.products.index')->with([
                'type_message' => 'warning',
                'message' => 'Oops Something Went Wrong! Message : ' . $th->getMessage()
            ]);
        }
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
        try {
            $logs = new Logs();

            DB::connection('pgsql')->beginTransaction();

            $validated = $request->validate([
                'barcode' => 'required|numeric|min:12|max:13',
                'product_name' => 'required|string|max:225',
                'category_id' => 'required|uuid',
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

            DB::connection('pgsql')->commit();

            $logs->insertLog('Product.update : Successfully updated product');

            return to_route('master.products.index')->with([
                'type_message' => 'success',
                'message' => 'Successfully updated product'
            ]);

        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return to_route('master.products.index')->with([
                'type_message' => 'warning',
                'message' => 'Oops Something Went Wrong! Message : ' . $th->getMessage()
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        try {
            $logs = new Logs();

            DB::connection('pgsql')->beginTransaction();

            $product->delete();

            DB::connection('pgsql')->commit();

            $logs->insertLog('Product.delete : Successfully delete product');

            return to_route('master.products.index')->with([
                'type_message' => 'success',
                'message' => 'Product deleted successfully'
            ]);

        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return to_route('master.products.index')->with([
                'type_message' => 'warning',
                'message' => 'Oops Something Went Wrong! Message : ' . $th->getMessage()
            ]);
        }
    }

    /**
     * Add discount to product.
     */
    public function addDiscountProduct(Request $request, $product_id)
    {
        try {
            $logs = new Logs();

            DB::connection('pgsql')->beginTransaction();

            $validated = $request->validate([
                'discount' => 'required'
            ]);

            Discount::updateOrCreate(
                ['product_id' => $product_id],
                [
                    'discount' => $validated['discount'
                ]
            ]);

            DB::connection('pgsql')->commit();

            $logs->insertLog('Product.discount : Successfully add discount to product');

            return to_route('master.products.index')->with([
                'type_message' => 'success',
                'message' => 'Successfully add discount to product'
            ]);
        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return to_route('master.products.index')->with([
                'type_message' => 'warning',
                'message' => 'Oops Something Went Wrong! Message : ' . $th->getMessage()
            ]);
        }
    }

     /**
     * Import data products from Excel.
     */

    public function importData(Request $request)
    {
        try {
            $logs = new Logs();

            DB::connection('pgsql')->beginTransaction();

            $validated = $request->validate([
                'file' => 'required|file|mimes:xlsx'
            ]);

            $file = $validated['file'];

            Excel::import(new ProductsImport, $file);

            DB::connection('pgsql')->commit();

            return response()->json([
                'indctr' => 1,
                'message' => 'Succesfully import data products'
            ]);

        } catch (\Throwable $th) {
            DB::connection('pgsql')->commit();

            return response()->json([
                'indctr' => 0,
                'message' => 'Oops Something Went Wrong! Message : ' . $th->getMessage()
            ]);
        }
    }

    public function exportData($format)
    {
        try {

            $export = new ProductsExport();
            switch ($format) {
                case 'xlsx':
                    return $export->download('products.xlsx');
                case 'csv':
                    return $export->download('products.csv', \Maatwebsite\Excel\Excel::CSV);
                case 'pdf':
                    return $export->download('products.pdf', \Maatwebsite\Excel\Excel::DOMPDF);
                default:
                    return to_route('master.products.index')->with([
                        'type_message' => 'warning',
                        'message' => 'Oops Something Went Wrong! Message : Invalid format'
                    ]);
            }
        } catch (\Throwable $th) {
            return to_route('master.products.index')->with([
                'type_message' => 'warning',
                'message' => 'Oops Something Went Wrong! Message : ' . $th
            ]);
        }
    }

    public function printBarcode(Product $product, $loop)
    {
        return Inertia::render('Product/Print', [
            'product' => $product,
            'loop' => $loop
        ]);
    }
}
