<?php


use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DownloadController;

use App\Http\Controllers\CashierController;
use App\Http\Controllers\PurchaseProductController;
use App\Http\Controllers\ClaimCustomerController;
use App\Http\Controllers\ClaimToSupplierController;

use App\Http\Controllers\ProductController;
use App\Http\Controllers\DiscountController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\ProfileController;

use App\Http\Controllers\ReportTransactionController;
use App\Http\Controllers\ReportProductsController;

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Exports\ProductsExport;
use App\Exports\CategoriesExport;
use Maatwebsite\Excel\Facades\Excel;

Route::get('/', function () {
    return redirect('/login');
});


Route::middleware('auth')->group(function () {

    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');



    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::put('notifications', [NotificationController::class, 'update'])->name('notifications.update');
    Route::get('notifications/read-all', [NotificationController::class, 'markAsReadAll'])->name('notifications.read-all');

    Route::get('/download', [DownloadController::class, 'download'])->name('download.file');

    Route::get('check-password', [ProfileController::class, 'checkPassword'])->name('check-password');

    Route::group(['prefix' => 'transaction'], function() {

        Route::resource('cashier', CashierController::class)->names('transaction.cashier');
        Route::post('cashier/new-transaction', [CashierController::class, 'newTransaction'])->name('transaction.cashier.new-transaction');
        Route::put('cashier/hold-transaction/{transaction}', [CashierController::class, 'holdTransaction'])->name('transaction.cashier.hold-transaction');
        Route::post('cashier/submit-transaction', [CashierController::class, 'submitTransaction'])->name('transaction.cashier.submit-transaction');
        Route::get('cashier/get-data-transaction/{param}', [CashierController::class, 'getDataTransaction'])->name('transaction.cashier.get-data-transactions');
        Route::get('cashier/print/{transaction}', [CashierController::class, 'print'])->name('transaction.cashier.print');

        Route::resource('purchase-products', PurchaseProductController::class)->names('transaction.purchase-products');
        Route::post('purchase-products/new-purchase', [PurchaseProductController::class, 'newPurchase'])->name('transaction.purchase-products.new-purchase');
        Route::post('purchase-products/submit', [PurchaseProductController::class, 'submit'])->name('transaction.purchase-products.submit');

        Route::resource('claim-customer', ClaimCustomerController::class)->names('transaction.claim-customers');

        Route::get('claim-customer/verify-transaction/{transaction_id}', [ClaimCustomerController::class, 'verifyTransaction'])->name('transaction.claim-customers.verify-transaction');

        Route::resource('claim-to-supplier', ClaimToSupplierController::class)->names('transaction.claim-to-suppliers');
        Route::get('claim-customer/verify-purchase/{purchase_id}', [ClaimCustomerController::class, 'verifyTransaction'])->name('transaction.claim-to-suppliers.verify-transaction');

    });

    Route::group(['prefix' => 'master'], function() {

        Route::resource('products', ProductController::class)->names('master.products');
        Route::get('products/get-data/{barcode}', [ProductController::class, 'getDataProductBarcode'])->name('master.products.get-data-barcode');
        Route::post('products/add-discount/{id}', [ProductController::class, 'addDiscountProduct'])->name('master.products.add-discount');
        Route::post('products/import-data', [ProductController::class, 'importData'])->name('master.products.import-data');

        Route::get('products/print-barcode/{product}/{value}', [ProductController::class, 'printBarcode'])->name('master.products.print-barcode');

        Route::get('products/get-products-transaction/{transaction_id}', [ProductController::class, 'getDataProductTransaction'])->name('master.products.get-product-transaction');


        Route::resource('discounts', DiscountController::class)->names('master.discounts');


        Route::resource('categories', CategoryController::class)->names('master.categories');


        Route::post('categories/import-data', [CategoryController::class, 'importData'])->name('master.categories.import-data');

        Route::resource('suppliers', SupplierController::class)->names('master.suppliers');
        Route::get('suppliers/get-data/{uniq_code}', [SupplierController::class, 'getDataSupplier'])->name('master.suppliers.get-data');
        Route::post('suppliers/import-data',  [SupplierController::class, 'importData'])->name('master.suppliers.import-data');



    });

    Route::group(['prefix' => 'report'], function() {

        Route::get('transactions', [ReportTransactionController::class, 'index'])->name('report.transactions.index');

        Route::get('transactions/get-transactions', [ReportTransactionController::class, 'getTransactions'])->name('report.transactions.get-transactions');
        Route::get('transactions/get-purchases', [ReportTransactionController::class, 'getPurchases'])->name('report.transactions.get-purchases');


        Route::get('transactions/get-detail-products/{id}', [ReportTransactionController::class, 'getTransactionDetails'])->name('report.transactions.get-detail-products');

        Route::get('products', [ReportProductsController::class, 'index'])->name('report.products.index');
        Route::get('products/get-products', [ReportProductsController::class, 'getProducts'])->name('report.products.get-products');

    });

    Route::get('/setting/profile', [ProfileController::class, 'edit'])->name('setting.profile.edit');
    Route::patch('/setting/profile', [ProfileController::class, 'update'])->name('setting.profile.update');
    Route::delete('/setting/profile', [ProfileController::class, 'destroy'])->name('setting.profile.destroy');
});


Route::get('/categories/export-data/{format}', [CategoryController::class, 'exportData'])->name('master.exports.categories.export-data');

Route::get('/products/export-data/{format}', [ProductController::class, 'exportData'])->name('master.exports.products.export-data');

Route::get('/report/transactions/export-data/{type}', [ReportTransactionController::class, 'exportData'])->name('report.exports.transactions.export-data');

Route::get('/transactions/claim-customers/export-data', [ClaimCustomerController::class, 'exportData'])->name('report.exports.claim-customers.export-data');

require __DIR__.'/auth.php';
