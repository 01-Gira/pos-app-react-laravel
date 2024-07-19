<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ClaimCustomer;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Logs;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Exception;
use Illuminate\Support\Str;

class ClaimCustomerController extends Controller
{
    public function index(Request $request)
    {
        $filters = [
            'search' => $request->input('search'),
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'status' => $request->input('status'),
        ];

        $perPage = $request->input('per_page', 5);

        $claimcustomers = ClaimCustomer::filter($filters)
            ->paginate($perPage);

        return Inertia::render('ClaimCustomer/Index', [
            'title' => 'Claim Customer',
            'status' => session('status'),
            'claimcustomers' => $claimcustomers->items(),
            'pagination' => [
                'current_page' => $claimcustomers->currentPage(),
                'total_pages' => $claimcustomers->lastPage(),
                'total_items' => $claimcustomers->total(),
                'per_page' => $claimcustomers->perPage(),
            ],
            'start_date' => $filters['start_date'],
            'end_date' => $filters['end_date'],
            'status' => $filters['status'],
        ]);
    }

    public function show(ClaimCustomer $claim_customer)
    {
        $claim_customer->load('product', 'transaction');

        return Inertia::render('ClaimCustomer/View', [
            'title' => 'Detail Claim Customer',
            'status' => session('status'),
            'claimcustomer' => $claim_customer
        ]);
    }

    public function create()
    {
        return Inertia::render('ClaimCustomer/Create', [
            'title' => 'Add Claim Customer',
            'status' => session('status')
        ]);
    }

    public function store(Request $request)
    {
        try {
            $log = new Logs();

            DB::connection('pgsql')->beginTransaction();

            $validated = $request->validate([
                'transaction_id' => 'required|exists:transactions,id',
                'product_id' => 'required|unique:claim_customers,product_id',
                'quantity' => 'required|numeric',
                'description' => 'required|string',
            ]);


            $validated['status'] = 'on_process';

            ClaimCustomer::create($validated);

            DB::connection('pgsql')->commit();

            $log->insertLog('ClaimCustomer.store : Successfully store data');

            return to_route('transaction.claim-customers.index')->with([
                'type_message' => 'success',
                'message' => 'Successfully store data'
            ]);

        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return to_route('transaction.claim-customers.index')->with([
                'type_message' => 'error',
                'message' => 'Oops Something Went Wrong! Message : ' . $th->getMessage()
            ]);

        }
    }


    public function update(ClaimCustomer $claim_customer, Request $request)
    {
        try {
            $log = new Logs();

            DB::connection('pgsql')->beginTransaction();

            $validated = $request->validate([
                'transaction_id' => 'required|exists:transactions,id',
                'product_id' => 'required',
                'quantity' => 'required|numeric',
                'description' => 'required|string',
                'status' => 'required|string'
            ]);
            // dd($validated);
            $claim_customer->quantity = $validated['quantity'];
            $claim_customer->description = $validated['description'];
            $claim_customer->status = $validated['status'];
            $claim_customer->save();

            if($validated['status'] == 'approved'){
                $transaction_detail = TransactionDetail::find(['transaction_id' => $validated['transaction_id'], 'product_id' => $validated['product_id']]);

                $transaction_detail->quantity -= $validated['quantity'];
                $new_price = $transaction_detail->price * $validated['quantity'];
                $transaction_detail->total_price = $new_price;
                $transaction_detail->save();


                $transaction = Transaction::find($validated['transaction_id']);
                $new_subtotal = $transaction->subtotal - $new_price;
                $new_ppn = (int)($new_subtotal * 0.1);
                $new_total_payment = (int)($new_subtotal + $new_ppn);
                $transaction->subtotal = $new_subtotal;
                $transaction->ppn = $new_ppn;
                $transaction->total_payment = $new_total_payment;
                $transaction->save();
            }

            DB::connection('pgsql')->commit();

            $log->insertLog('ClaimCustomer.store : Successfully update data');

            return to_route('transaction.claim-customers.index')->with([
                'type_message' => 'success',
                'message' => 'Successfully update data'
            ]);

        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return to_route('transaction.claim-customers.index')->with([
                'type_message' => 'error',
                'message' => 'Oops Something Went Wrong! Message : ' . $th->getMessage()
            ]);

        }
    }

    public function verifyTransaction($transaction_id)
    {
        $indctr = 0;
        $msg = 'Transaction is not exist';

        if (!Str::isUuid($transaction_id)) {
            return response()->json(['indctr' => $indctr, 'message' => 'Invalid transaction ID']);
        }

        try {
            $transaction = Transaction::findOrFail($transaction_id);
            $indctr = 1;
            $msg = 'Transaction is exist';
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            $indctr = 0;
            $msg = 'Transaction is not exist';
        }

        return response()->json(['indctr' => $indctr, 'message' => $msg]);
    }
}
