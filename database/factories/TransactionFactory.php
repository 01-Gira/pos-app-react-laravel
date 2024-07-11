<?php

namespace Database\Factories;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition()
    {
        return [
            'transaction_date' => $this->faker->dateTimeThisMonth(),
        ];
    }

    public function configure()
    {
        return $this->state(function (array $attributes) {
            return [
                'payment_method' => $this->faker->randomElement(['cash', 'credit']),
                'status' => $this->faker->randomElement(['completed']),
                'created_at' => $this->faker->dateTimeThisMonth(),
                'updated_at' => $this->faker->dateTimeThisMonth(),
            ];
        })->afterCreating(function (Transaction $transaction) {
            // Ambil atau buat detail transaksi terkait
            $rand_number = $this->faker->numberBetween(1, 10);
            $transaction->transactionDetails()->saveMany(
                TransactionDetail::factory()->count($rand_number)->make([
                    'transaction_id' => $transaction->id,
                ])
            );

            // Hitung subtotal, ppn, total_payment, dan update ke transaksi
            $subtotal = $transaction->transactionDetails()->sum('total_price');
            $ppn = (int) round($subtotal * 0.1);
            $total_payment = (int) round($subtotal + $ppn);

            $transaction->update([
                'subtotal' => $subtotal,
                'ppn' => $ppn,
                'total_payment' => $total_payment,
            ]);
        });
    }
}
