<?php

namespace Database\Factories;

use App\Models\Purchase;
use App\Models\PurchaseDetail;
use Illuminate\Database\Eloquent\Factories\Factory;


class PurchaseFactory extends Factory
{
    protected $model = Purchase::class;

    public function definition(): array
    {
        return [
            'supplier_id' => Supplier::factory(),
            'purchase_date' => $this->faker->dateTimeThisMonth(),
            'created_at' => $this->faker->dateTimeThisMonth(),
            'updated_at' => $this->faker->dateTimeThisMonth(),
        ];
    }

    public function configure()
    {
        return $this->state(function (array $attributes) {
            return [
                'payment_method' => $this->faker->randomElement(['cash', 'credit']),
                'status' => $this->faker->randomElement(['completed']),
            ];
        })->afterCreating(function (Purchase $purchase) {
            $rand_number = $this->faker->numberBetween(1, 10);
            $purchase->purchaseDetails()->saveMany(
                PurchaseDetail::factory()->count($rand_number)->make([
                    'purchase_id' => $purchase->id,
                ])
            );

            $subtotal = $purchase->purchaseDetails()->sum('total_price');
            $ppn = (int) round($subtotal * 0.1);
            $total_payment = (int) round($subtotal + $ppn);

            $purchase->update([
                'subtotal' => $subtotal,
                'ppn' => $ppn,
                'total_payment' => $total_payment,
            ]);
        });
    }
}
