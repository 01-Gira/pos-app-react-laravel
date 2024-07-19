<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Models\Supplier;
use App\Models\Purchase;
use App\Models\PurchaseDetail;
use App\Models\Transaction;
use App\Models\TransactionDetail;


// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Store::factory(1)->create();

        // Category::factory(40)->create();

        // Product::factory(100)->create();

        // Supplier::factory(10)->create();

        Transaction::factory(5000)->create();
        Purchase::factory(5000)->create();
    }
}
