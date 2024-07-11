<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Transaction;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TransactionDetail>
 */
class TransactionDetailFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $product = Product::inRandomOrder()->first();
        $quantity = $this->faker->numberBetween(1, 10);
        $discount = $this->faker->numberBetween(0, 80); // discount in percentage
        $price = $product->price;

        $total_price = (int) round($quantity * $price * (1 - $discount / 100));

        return [
            'transaction_id' => Transaction::factory(),
            'product_id' => $product->id,
            'quantity' => $quantity,
            'discount' => $discount,
            'price' => $price,
            'total_price' => $total_price,
            'created_at' => $this->faker->dateTimeThisMonth(),
            'updated_at' => $this->faker->dateTimeThisMonth(),
        ];
    }

}
