<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Category;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $barcode = str_pad((string) $this->faker->numberBetween(1, 999999999999), 12, '0', STR_PAD_LEFT);

        return [
            'barcode' => $barcode,
            'product_name' => $this->faker->word,
            'category_id' => Category::inRandomOrder()->first(),
            'type' => $this->faker->randomElement(['pcs', 'pack']),
            'stock' => $this->faker->numberBetween(1, 100),
            'price' => $this->faker->numberBetween(1000, 100000),
        ];
    }
}
