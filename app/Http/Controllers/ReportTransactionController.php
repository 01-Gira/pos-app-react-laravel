<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionDetail;

use App\Models\Category;

use App\Models\Purchase;
use App\Models\PurchaseDetail;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Carbon\Carbon;

class ReportTransactionController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Reports/Transactions', [
            'title' => 'Report Transactions',
            'status' => session('status'),
            'categories' => Category::all()
        ]);
    }

    public function getTransactions(Request $request)
    {
        $search = $request->input('search');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $status = $request->input('status');
        $payment_method = $request->input('payment_method');
        $category = $request->input('category');

        $perPage = $request->input('per_page', 5);
        $page = $request->input('page', 1);

        $transactions = Transaction::query()
            ->when($search, function ($query, $search) {
                return $query->where('id', 'like', "%{$search}%")
                            ->orWhere('status', 'like', "%{$search}%");
            })
            ->when($startDate, function ($query, $startDate) {
                return $query->whereDate('transaction_date', '>=', $startDate);
            })
            ->when($endDate, function ($query, $endDate) {
                return $query->whereDate('transaction_date', '<=', $endDate);
            })
            ->when($status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($payment_method, function ($query, $payment_method) {
                return $query->where('payment_method', $payment_method);
            })
            ->when($category, function ($query, $category) {
                return $query->whereHas('transactionDetails.product.category', function ($query) use ($category) {
                    $query->where('id', $category);
                });
            })
            ->with('transactionDetails.product.category')
            ->orderByDesc('transaction_date')
            ->paginate($perPage, ['*'], 'page', $page);


        return response()->json([
            'transactions' => $transactions->items(),
            'pagination' => [
                'current_page' => $transactions->currentPage(),
                'total_pages' => $transactions->lastPage(),
                'total_items' => $transactions->total(),
                'per_page' => $transactions->perPage(),
            ],
            'start_date' => $startDate,
            'end_date' => $endDate,
            'search' => $search,
            'status' => $status,
            'payment_method' => $payment_method,
            'category' => $category
        ]);
    }

    public function getPurchases(Request $request)
    {
        $search = $request->input('search');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $status = $request->input('status');
        $payment_method = $request->input('payment_method');
        $category = $request->input('category');

        $perPage = $request->input('per_page', 5);
        $page = $request->input('page', 1);

        $purchases = Purchase::query()
            ->when($search, function ($query, $search) {
                return $query->where('id', 'like', "%{$search}%")
                            ->orWhere('status', 'like', "%{$search}%");
            })
            ->when($startDate, function ($query, $startDate) {
                return $query->whereDate('purchase_date', '>=', $startDate);
            })
            ->when($endDate, function ($query, $endDate) {
                return $query->whereDate('purchase_date', '<=', $endDate);
            })
            ->when($status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($payment_method, function ($query, $payment_method) {
                return $query->where('payment_method', $payment_method);
            })
            ->when($category, function ($query, $category) {
                return $query->whereHas('purchaseDetails.product.category', function ($query) use ($category) {
                    $query->where('id', $category);
                });
            })
            ->with('purchaseDetails.product.category')
            ->orderByDesc('purchase_date')
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'purchases' => $purchases->items(),
            'pagination' => [
                'current_page' => $purchases->currentPage(),
                'total_pages' => $purchases->lastPage(),
                'total_items' => $purchases->total(),
                'per_page' => $purchases->perPage(),
            ],
            'start_date' => $startDate,
            'end_date' => $endDate,
            'search' => $search,
            'status' => $status,
            'payment_method' => $payment_method,
            'category' => $category
        ]);
    }

    public function getTransactionDetails($id, Request $request)
    {

        $type = $request->type;
        $data = [];

        if($type == 'cashier'){
            $data = TransactionDetail::where('transaction_id', $id)->with('product')->get();
        }else{
            $data = PurchaseDetail::where('purchase_id', $id)->with('product')->get();
        }

        return response()->json(['msg' => 'Successfully get data', 'data' => $data]);

    }
}
