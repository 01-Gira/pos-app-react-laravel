<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Discount;
use App\Models\Logs;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Imports\DiscountImport;
use Maatwebsite\Excel\Facades\Excel;

class DiscountController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('per_page', 5);
        $startDate = $request->input('start_date');
        $startDate = empty($startDate) ? Carbon::now()->firstOfMonth()->format('Y-m-d') : $startDate;
        $endDate = $request->input('end_date');
        $endDate = empty($endDate) ? Carbon::now()->endOfMonth()->format('Y-m-d') : $endDate;

        $discounts = Discount::query()
            ->when($search, function ($query, $search) {
                return $query->whereHas('product', function ($query) use ($search) {
                    $query->where('product_name', 'like', "%{$search}%")
                          ->orWhere('barcode', 'like', "%{$search}%")
                          ->orWhere('discount', 'like', "%{$search}%");
                });
            })
            ->when($startDate, function ($query, $startDate) {
                return $query->whereDate('created_at', '>=', $startDate);
            })
            ->when($endDate, function ($query, $endDate) {
                return $query->whereDate('created_at', '<=', $endDate);
            })
            ->with('product')
            ->orderByDesc('created_at')
            ->paginate($perPage);

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
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $logs = new Logs();

            $validated = $request->validate([
                'product_id' => 'required|unique:'.Discount::class,
                'product_name' => 'required',
                'discount' => 'required|numeric'
            ]);

            DB::connection('pgsql')->beginTransaction();

            Discount::create([
                'product_id' => $validated['product_id'],
                'discount' => $validated['discount']
            ]);

            DB::connection('pgsql')->commit();

            $logs->insertLog('Discount.store : Successfully add discount');

            return to_route('master.discounts.index')->with([
                'type_message' => 'success',
                'message' => 'Successfully add discount to ' . $validated['product_name']
            ]);

        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return to_route('master.discounts.index')->with([
                'type_message' => 'warning',
                'message' => 'Oops Something Went Wrong! Message : ' . $th->getMessage()
            ]);
        }
    }

    public function update(Discount $discount, Request $request)
    {
        try {
            $logs = new Logs();

            $validated = $request->validate([
                'discount' => 'required|numeric'
            ]);

            DB::connection('pgsql')->beginTransaction();

            $discount->discount = $validated['discount'];
            $discount->save();

            DB::connection('pgsql')->commit();

            $logs->insertLog('Discount.update : Successfully update discount');

            return to_route('master.discounts.index')->with([
                'type_message' => 'success',
                'message' => 'Successfully update discount'
            ]);
        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return to_route('master.discounts.index')->with([
                'type_message' => 'warning',
                'message' => 'Oops Something Went Wrong! Message : ' . $th->getMessage()
            ]);
        }
    }

    public function destroy(Discount $discount)
    {
        try {
            $logs = new Logs();

            DB::connection('pgsql')->beginTransaction();

            $discount->delete();

            DB::connection('pgsql')->commit();

            return to_route('master.discounts.index')->with([
                'type_message' => 'success',
                'message' => 'Discount deleted successfully'
            ]);

        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return to_route('master.discounts.index')->with([
                'type_message' => 'warning',
                'message' => 'Oops Something Went Wrong! Message : ' . $th->getMessage()
            ]);
        }
    }
}
