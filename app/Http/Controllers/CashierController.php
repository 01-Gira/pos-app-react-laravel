<?php

namespace App\Http\Controllers;

use App\Models\Product;
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
        try {
            $logs = new Logs();

            DB::connection('pgsql')->beginTransaction();

            $transaction = Transaction::create([
                'transaction_date' => Carbon::now(),
                'status' => 'process'
            ]);

            DB::connection('pgsql')->commit();

            $logs->insertLog('Cashier.New Transaction : Successfully created new transaction');

            return response()->json([
                'indctr' => 1,
                'type_message' => 'success',
                'message' => 'Successfully created new transaction',
                'transaction' => $transaction
            ]);

        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return response()->json([
                'indctr' => 0,
                'type_message' => 'warning',
                'message' => $th->getMessage()
            ]);
        }
    }

    /**
     * Scan product to save into Transaction Detail.
     */
    public function holdTransaction(Request $request, Transaction $transaction)
    {
        try {
            $logs = new Logs();

            DB::connection('pgsql')->beginTransaction();

            $status = $request->status;
            $transactions = $request->transactions;

            if($status == 'completed'){
                if($transactions[0]['payment_method'] == null || $transactions[0]['payment_method'] == ''){
                    throw new Exception('Please select payment method first!');
                }

                if($transactions[0]['transaction_details'] == null ){
                    throw new Exception('Product list is empty!');
                }

                foreach ($transactions[0]['transaction_details'] as $key => $value) {
                    if($value['quantity'] == 0 || $value['quantity'] == null){
                        throw new Exception('Quantity can not be empty');
                    }

                    if($value['discount'] === null){
                        throw new Exception('Discount can not be empty');
                    }

                    $product = Product::where('id', $value['product']['id'])->first();
                    // dd($product);
                    if($product->stock <= $value['quantity']){
                        throw new Exception('Your product '.$product->product_name.' stock is less than ' . $value['quantity']);
                    }

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

                    $product->stock -= $value['quantity'];
                    $product->save();
                }
            }

            $transaction->status = $status;

            if($transactions){
                $transaction->subtotal = $transactions[0]['subtotal'];
                $transaction->ppn = $transactions[0]['ppn'];
                $transaction->total_payment = $transactions[0]['total_payment'];
                $transaction->payment_method = $transactions[0]['payment_method'];
            }

            $transaction->save();
            $transaction->load('transactionDetails.product');

            DB::connection('pgsql')->commit();

            $logs->insertLog('Cashier.Change Status : Successfully change status');

            return response()->json([
                'indctr' => 1,
                'type_message' => 'success',
                'message' => 'Successfully Change status on '.$status,
                'transaction' => $transaction
            ]);
        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return response()->json([
                'indctr' => 0,
                'type_message' => 'warning',
                'message' => $th->getMessage()
            ]);
        }
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
        try {
            $logs = new Logs();

            DB::connection('pgsql')->beginTransaction();

            $transactionID->update([
                'status' => 'hold'
            ]);

            DB::connection('pgsql')->commit();

            $logs->inertLog('Cashier.Submit Transaction : Successfully submit transaction');

            return response()->json([
                'indctr' => 1,
                'type_message' => 'success',
                'message' => 'Successfully submit transaction',
                'transaction' => $transaction
            ]);

        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return response()->json([
                'indctr' => 0,
                'type_message' => 'warning',
                'message' => $th->getMessage()
            ]);
        }
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
        try {
            $logs = new Logs();

            DB::connection('pgsql')->beginTransaction();

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
                if($value['quantity'] == 0 || $value['quantity'] == null){
                    throw new Exception('Quantity can not be empty');
                }

                if($value['discount'] === null){
                    throw new Exception('Discount can not be empty');
                }

                $product = Product::where('id', $value['product']['id'])->first();

                if($product->stock <= $value['quantity']){
                    throw new Exception('Your product '.$product->product_name.' stock is less than ' . $value['quantity']);
                }

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

                if($transaction['status'] == 'completed'){
                    $product->stock -= $value['quantity'];
                    $product->save();
                }
            }

            DB::connection('pgsql')->commit();

            $logs->insertLog('Cashier.store : Successfully store transaction');

            return response()->json([
                'indctr' => 1,
                'type_message' => 'success',
                'message' => 'Successfully store transaction'
            ]);
        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return response()->json([
                'indctr' => 0,
                'type_message' => 'warning',
                'message' => $th->getMessage()
            ]);
        }
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
