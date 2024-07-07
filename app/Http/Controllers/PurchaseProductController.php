<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PurchaseProductController extends Controller
{
    return Inertia::render('Product/Index', [
        'title' => 'Transaction Purchase Products',
        'status' => session('status'),
    ]);
}
