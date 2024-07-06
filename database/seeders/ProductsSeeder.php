<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Product::factory()->create([
            'id' => Str::uuid()->toString(),
            'uniq_code' => 'PROD001',
            'product_name' => 'Laptop Dell XPS 15',
            'category_id' => DB::table('categories')->where('category_name', 'Electronics')->value('id'),
            'stock' => 50,
            'price' => 1500,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Product::factory()->create([
            'id' => Str::uuid()->toString(),
            'uniq_code' => 'PROD002',
            'product_name' => 'Men\'s Casual Shirt',
            'category_id' => DB::table('categories')->where('category_name', 'Clothing')->value('id'),
            'stock' => 100,
            'price' => 50,
            'created_at' => now(),
            'updated_at' => now(),
        ]);


        Product::factory()->create([
            'id' => Str::uuid()->toString(),
            'uniq_code' => 'PROD003',
            'product_name' => 'Harry Potter and the Sorcerer\'s Stone',
            'category_id' => DB::table('categories')->where('category_name', 'Books')->value('id'),
            'stock' => 25,
            'price' => 15,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Insert products into database
        // DB::table('products')->insert($products);
    }
}
