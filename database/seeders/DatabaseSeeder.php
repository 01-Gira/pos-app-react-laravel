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
        Store::factory(1)->create();
        Category::factory(3)->create();

        $categoryIds = Category::pluck('id')->toArray();


        Product::factory(5)->create([
            'category_id' => function () use ($categoryIds) {
                return $categoryIds[array_rand($categoryIds)];
            },
        ]);


        Supplier::factory(3)->create();

        Transaction::factory(500)->create();
        Purchase::factory(500)->create();

        // TransactionDetail::factory(2000)->create();



    }
}
