<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\PurchaseDetail;
use App\Models\Supplier;
use App\Models\Product;



use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Carbon\Carbon;

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
        $purchase = Purchase::create([
            'purchase_date' => Carbon::now(),
            'status' => 'process'
        ]);

        return response()->json([
            'type_message' => 'success',
            'message' => 'Successfully created new purchase',
            'purchase' => $purchase
        ]);
    }

    /**
     * Store purchase.
     */
    public function store(Request $request)
    {
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

        return response()->json([
            'type_message' => 'success',
            'message' => 'Successfully store purchase detail',
        ]);
    }

    /**
     * Submit purchase.
     */

     public function submit(Request $request)
     {
         $purchase = $request->purchase;
    
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
 
         return response()->json([
             'type_message' => 'success',
             'message' => 'Successfully submit purchase detail',
         ]);
     }
 
}
