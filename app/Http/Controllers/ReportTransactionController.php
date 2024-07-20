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
use Maatwebsite\Excel\Facades\Excel;

use App\Exports\TransactionsExport;
use App\Exports\TransactionDetailsExport;
use App\Exports\PurchasesExport;
use App\Exports\PurchaseDetailsExport;

use App\Notifications\ExportCompleted;
use App\Jobs\NotifyUserOfCompletedExport;

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
        $filters = [
            'search' => $request->input('search'),
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'status' => $request->input('status'),
            'payment_method' => $request->input('payment_method'),
            'category' => $request->input('category'),
        ];

        $perPage = $request->input('per_page', 5);
        $page = $request->input('page', 1);

        $transactions = Transaction::filter($filters)
            ->paginate($perPage, ['*'], 'page', $page);


        return response()->json([
            'transactions' => $transactions->items(),
            'pagination' => [
                'current_page' => $transactions->currentPage(),
                'total_pages' => $transactions->lastPage(),
                'total_items' => $transactions->total(),
                'per_page' => $transactions->perPage(),
            ],
            'start_date' => $filters['start_date'],
            'end_date' => $filters['end_date'],
            'search' => $filters['search'],
            'status' => $filters['status'],
            'payment_method' => $filters['payment_method'],
            'category' => $filters['category']
        ]);
    }

    public function getPurchases(Request $request)
    {
        $filters = [
            'search' => $request->input('search'),
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'status' => $request->input('status'),
            'payment_method' => $request->input('payment_method'),
            'category' => $request->input('category'),
        ];

        $perPage = $request->input('per_page', 5);
        $page = $request->input('page', 1);

        $purchases = Purchase::filter($filters)
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'purchases' => $purchases->items(),
            'pagination' => [
                'current_page' => $purchases->currentPage(),
                'total_pages' => $purchases->lastPage(),
                'total_items' => $purchases->total(),
                'per_page' => $purchases->perPage(),
            ],
            'start_date' => $filters['start_date'],
            'end_date' => $filters['end_date'],
            'search' => $filters['search'],
            'status' => $filters['status'],
            'payment_method' => $filters['payment_method'],
            'category' => $filters['category']
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

    public function exportData(Request $request, $type)
    {
        try {

            $filters = $request->only(['start_date', 'end_date', 'status', 'payment_method']);

            $fileName = $type . ' ' . $filters['start_date'] . ' - ' .$filters['end_date'] . '.xlsx';

            $filePath = 'exports/' . $fileName;

            $array = [
                'type' => $type,
                'fileName' => $fileName,
            ];

            // dd($type);

            switch($type) {
                case 'Transactions':
                    (new TransactionsExport($filters))->store($filePath, 'public')->chain([
                        new NotifyUserOfCompletedExport(request()->user(), $array),
                    ]);
                    break;
                case 'Purchases':
                    (new PurchasesExport($filters))->store($filePath, 'public')->chain([
                        new NotifyUserOfCompletedExport(request()->user(), $array),
                    ]);
                    break;
                case 'Transaction Details':
                    (new TransactionDetailsExport($filters))->store($filePath, 'public')->chain([
                        new NotifyUserOfCompletedExport(request()->user(), $array),
                    ]);
                    break;
                case 'Purchase Details':
                    (new PurchaseDetailsExport($filters))->store($filePath, 'public')->chain([
                        new NotifyUserOfCompletedExport(request()->user(), $array),
                    ]);
                    break;
                default :
                    return back()->with([
                        'type_message' => 'warning',
                        'message' => 'Type is unknown'
                    ]);
            }

            return back()->with([
                'title' => 'Success',
                'type_message' => 'success',
                'message' => 'Process export is on process, you will be notified when is ready to download'
            ]);

        } catch (\Throwable $th) {
            // throw $th;
            return to_route('report.transactions.index')->with([
                'title' => 'Error',
                'type_message' => 'error',
                'message' => 'Oops Something Went Wrong! Message : ' . $th->getMessage()
            ]);
        }
    }
}
