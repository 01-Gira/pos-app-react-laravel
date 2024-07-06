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
            'message' => 'Created new transaction successfully',
            'transaction' => $transaction
        ]);
    }

    /**
     * Scan product to save into Transaction Detail.
     */
    public function holdTransaction(Transaction $transaction)
    {
        $transaction->status = 'hold';
        $transaction->save();

        return response()->json([
            'type_message' => 'success',
            'message' => 'Transaction on hold successfully',
            'transaction' => $transaction
        ]);
    }

     /**
     * Get data transaction on hold .
     */
    public function getDataTransaction()
    {
        $transactions = Transaction::where('status', 'hold')->orderByDesc('created_at')->get();

        return response()->json([
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
            'message' => 'Created new transaction successfully',
            'transaction' => $transaction
        ]);
    }

    /**
     * Scan product to save into Transaction Detail.
     */
    public function scanProduct(Request $request)
    {
        $transactions = $request->transactions;

        $transaction = $transactions[0];
        // dd($transaction);
        Transaction::where('id', $transaction['id'])->update([
            'ppn' => $transaction['ppn'],
            'total_payment' => $transaction['total_payment'],
            'status' => 'process'
        ]);

        foreach ($transaction['products'] as $key => $value) {
            TransactionDetail::updateOrCreate(
                [
                    'transaction_id' => $transaction['id'],
                    'product_id' => $value['id']
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
            'message' => 'Created new transaction detail successfully',
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
        //
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
