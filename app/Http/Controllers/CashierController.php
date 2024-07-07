<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Carbon\Carbon;

class CashierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Cashier/Index', [
            'title' => 'Cashier',
            'status' => session('status'),
        ]);
    }

    /**
     * Create new transaction.
     */
    public function newTransaction()
    {
        $transaction = Transaction::create([
            'transaction_date' => Carbon::now(),
            'status' => 'process'
        ]);

        return response()->json([
            'type_message' => 'success',
            'message' => 'Successfully created new transaction',
            'transaction' => $transaction
        ]);
    }

    /**
     * Scan product to save into Transaction Detail.
     */
    public function holdTransaction(Request $request, Transaction $transaction)
    {
        $status = $request->status;
        $transactions = $request->transactions;

        // dd($status);
        $transaction->status = $status;

        if($transactions){
            $transaction->subtotal = $transactions[0]['subtotal'];
            $transaction->ppn = $transactions[0]['ppn'];
            $transaction->total_payment = $transactions[0]['total_payment'];
            $transaction->payment_method = $transactions[0]['payment_method'];
        }

        $transaction->save();
        $transaction->load('transactionDetails.product'); 
    
        return response()->json([
            'type_message' => 'success',
            'message' => 'Successfully Change status on '.$status,
            'transaction' => $transaction
        ]);
    }

     /**
     * Get data transaction on hold .
     */
    public function getDataTransaction(Request $request, $param)
    {
        $keyword = $request->query('keyword');

        $query = Transaction::where('status', $param);

        if (!empty($keyword)) {
            $query->where(function ($q) use ($keyword) {
                $q->where('id', 'like', '%' . $keyword . '%')
                  ->orWhere('created_at', 'like', '%' . $keyword . '%')
                  ->orWhere('updated_at', 'like', '%' . $keyword . '%');
            });
        }
        $transactions = $query->orderByDesc('created_at')->get();

        return response()->json([
            'type_message' => 'succes',
            'message' => 'Success get data',
            'transactions' => $transactions 
        ]);
    }



    /**
     * Scan product to save into Transaction Detail.
     */
    public function submitTransaction(Transaction $transactionID)
    {
        $transactionID->update([
            'status' => 'hold'
        ]);

        return response()->json([
            'type_message' => 'success',
            'message' => 'Successfully Created new transaction',
            'transaction' => $transaction
        ]);
    }

    /**
     * Print Receipt .
     */
    public function print(Transaction $transaction)
    {
        $transaction->load('transactionDetails.product'); 

        return Inertia::render('Cashier/Print', [
            'title' => 'Cashier',
            'status' => session('status'),
            'transaction' => $transaction 
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
    public function store(Request $request)
    {
        $transactions = $request->transactions;

        $transaction = $transactions[0];
 
        Transaction::where('id', $transaction['id'])->update([
            'ppn' => $transaction['ppn'],
            'subtotal' => $transaction['subtotal'],
            'total_payment' => $transaction['total_payment'],
            'status' => 'process',
            'payment_method' => $transaction['payment_method']
        ]);

        foreach ($transaction['transaction_details'] as $key => $value) {
            TransactionDetail::updateOrCreate(
                [
                    'transaction_id' => $transaction['id'],
                    'product_id' => $value['product']['id']
                ],
                [
                'quantity' => $value['quantity'],
                'discount' => $value['discount'],
                'price' => $value['price'],
                'total_price' => $value['total_price']
                ]
            );
        }

        return response()->json([
            'type_message' => 'success',
            'message' => 'Successfully Created new transaction detail',
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $transaction)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Transaction $transaction)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Transaction $transaction)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transaction $transaction)
    {
        //
    }
}
