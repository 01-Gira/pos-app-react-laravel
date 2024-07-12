<?php

use App\Http\Controllers\CashierController;
use App\Http\Controllers\PurchaseProductController;

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

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


Route::middleware('auth')->group(function () {

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

    });

    Route::group(['prefix' => 'master'], function() {

        Route::resource('products', ProductController::class)->names('master.products');
        Route::get('products/get-data/{barcode}', [ProductController::class, 'getDataProduct'])->name('master.products.get-data');
        Route::post('products/add-discount/{id}', [ProductController::class, 'addDiscountProduct'])->name('master.products.add-discount');
        Route::post('products/import-data', [ProductController::class, 'importData'])->name('master.products.import-data');
        Route::get('products/print-barcode/{barcodes}', [ProductController::class, 'printBarcode'])->name('master.products.print-barcode');

        Route::resource('discounts', DiscountController::class)->names('master.discounts');

        Route::resource('categories', CategoryController::class)->names('master.categories');
        Route::post('categories/import-data', [CategoryController::class, 'importData'])->name('master.categories.import-data');

        Route::resource('suppliers', SupplierController::class)->names('master.suppliers');
        Route::get('suppliers/get-data/{uniq_code}', [SupplierController::class, 'getDataSupplier'])->name('master.suppliers.get-data');
        Route::post('suppliers/import-data',  [SupplierController::class, 'importData'])->name('master.suppliers.import-data');

    });

    Route::group(['prefix' => 'report'], function() {

        // Route::resource('transactions', ReportTransactionController::class)->name('report.transactions');
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

require __DIR__.'/auth.php';
