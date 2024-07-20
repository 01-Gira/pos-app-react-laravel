<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\PurchaseDetail;
use App\Models\Supplier;
use App\Models\Product;
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

class PurchaseProductController extends Controller
{
    /**
     * Index Purchase Products.
     */
    public function index()
    {
        return Inertia::render('PurchaseProduct/Index', [
            'title' => 'Transaction Purchase Products',
            'suppliers' => Supplier::all(),
            'status' => session('status'),
        ]);
    }

     /**
     * Create new purchase.
     */
    public function newPurchase()
    {
        try {
            $logs = new Logs();

            DB::connection('pgsql')->beginTransaction();

            $purchase = Purchase::create([
                'purchase_date' => Carbon::now(),
                'status' => 'process'
            ]);

            DB::connection('pgsql')->commit();

            $logs->insertLog('PurchaseProduct.New Purchase : Successfully create new purchase');

            return response()->json([
                'indctr' => 1,
                'type_message' => 'success',
                'message' => 'Successfully create new purchase',
                'purchase' => $purchase
            ]);

        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return response()->json([
                'indctr' => 0,
                'type_message' => 'warning',
                'message' => $th->getMessage(),
            ]);
        }
    }

    /**
     * Store purchase.
     */
    public function store(Request $request)
    {
        try {
            $logs = new Logs();

            DB::connection('pgsql')->beginTransaction();

            $purchase = $request->purchase;

            Purchase::where('id', $purchase['id'])->update([
                'ppn' => $purchase['ppn'],
                'supplier_id' => $purchase['supplier_id'],
                'subtotal' => $purchase['subtotal'],
                'total_payment' => $purchase['total_payment'],
                'status' => 'process',
                'payment_method' => $purchase['payment_method']
            ]);


            foreach ($purchase['purchase_details'] as $key => $value) {

                if($value['quantity'] == 0 || $value['quantity'] == null){
                    throw new Exception('Quantity can not be less than 0');
                }


                PurchaseDetail::updateOrCreate(
                    [
                        'purchase_id' => $purchase['id'],
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

            DB::connection('pgsql')->commit();

            $logs->insertLog('PurchaseProduct.store : Successfully store purchase');

            return response()->json([
                'indctr' => 1,
                'type_message' => 'success',
                'message' => 'Successfully store purchase',
            ]);
        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return response()->json([
                'indctr' => 0,
                'type_message' => 'warning',
                'message' => $th->getMessage(),
            ]);
        }
    }

    /**
     * Submit purchase.
     */

     public function submit(Request $request)
     {
        try {
            $logs = new Logs();

            DB::connection('pgsql')->beginTransaction();

            $purchase = $request->purchase;

            if($purchase['payment_method'] == null || $purchase['payment_method'] == ''){
                throw new Exception('Please select payment method first!');
            }

            if($purchase['purchase_details'] == null ){
                throw new Exception('Product list is empty!');
            }

            Purchase::where('id', $purchase['id'])->update([
                'ppn' => $purchase['ppn'],
                'supplier_id' => $purchase['supplier_id'],
                'subtotal' => $purchase['subtotal'],
                'total_payment' => $purchase['total_payment'],
                'status' => 'completed',
                'payment_method' => $purchase['payment_method']
            ]);

            foreach ($purchase['purchase_details'] as $key => $value) {
                PurchaseDetail::updateOrCreate(
                    [
                        'purchase_id' => $purchase['id'],
                        'product_id' => $value['product']['id']
                    ],
                    [
                    'quantity' => $value['quantity'],
                    'discount' => $value['discount'],
                    'price' => $value['price'],
                    'total_price' => $value['total_price']
                    ]
                );

                Product::where('id', $value['product']['id'])->update([
                   'stock' => \DB::raw('stock + ' . $value['quantity'])
               ]);

            }

            DB::connection('pgsql')->commit();

            $logs->insertLog('PurchaseProduct.submit : Successfully submit purchase');

            return response()->json([
                'indctr' => 1,
                'type_message' => 'success',
                'message' => 'Successfully submit purchase',
            ]);
        } catch (\Throwable $th) {
            DB::connection('pgsql')->rollback();

            return response()->json([
                'indctr' => 0,
                'type_message' => 'warning',
                'message' => $th->getMessage(),
            ]);
        }
     }

}
