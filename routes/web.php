<?php

use App\Http\Controllers\CashierController;

use App\Http\Controllers\ProductController;
use App\Http\Controllers\DiscountController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\ProfileController;

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
    Route::resource('/transaction/cashier', CashierController::class)->names('transaction.cashier');
    Route::post('/transaction/cashier/new-transaction', [CashierController::class, 'newTransaction'])->name('transaction.cashier.new-transaction');
    Route::put('/transaction/cashier/hold-transaction/{transaction}', [CashierController::class, 'holdTransaction'])->name('transaction.cashier.hold-transaction');
    Route::post('/transaction/cashier/submit-transaction', [CashierController::class, 'submitTransaction'])->name('transaction.cashier.submit-transaction');
    Route::get('/transaction/cashier/get-data-transaction', [CashierController::class, 'getDataTransaction'])->name('transaction.cashier.get-data-transactions');

    Route::post('/transaction/cashier/scan-product', [CashierController::class, 'scanProduct'])->name('transaction.cashier.scan-product');


    Route::resource('/master/products', ProductController::class)->names('master.products');
    Route::get('/master/products/get-data/{barcode}', [ProductController::class, 'getDataProduct'])->name('master.products.get-data');
    Route::post('/master/products/add-discount/{id}', [ProductController::class, 'addDiscountProduct'])->name('master.products.add-discount');

    Route::resource('/master/discounts', DiscountController::class)->names('master.discounts');

    Route::resource('/master/categories', CategoryController::class)->names('master.categories');

    Route::resource('/master/suppliers', SupplierController::class)->names('master.suppliers');
    Route::get('/master/suppliers/get-data/{uniq_code}', [SupplierController::class, 'getDataSupplier'])->name('master.suppliers.get-data');


    Route::get('/setting/profile', [ProfileController::class, 'edit'])->name('setting.profile.edit');
    Route::patch('/setting/profile', [ProfileController::class, 'update'])->name('setting.profile.update');
    Route::delete('/setting/profile', [ProfileController::class, 'destroy'])->name('setting.profile.destroy');
});

require __DIR__.'/auth.php';
