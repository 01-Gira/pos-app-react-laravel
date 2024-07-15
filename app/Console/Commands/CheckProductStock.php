<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\User;
use App\Notifications\ProductLowStock;
use Illuminate\Support\Facades\Notification;

class CheckProductStock extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-product-stock';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check product stock and notify if low';
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $products = Product::where('stock', '<=', 10)->get();

        foreach ($products as $product) {
            $admins = User::get();

            foreach ($admins as $admin) {
                $admin->notify(new ProductLowStock($product));
            }
        }

        $this->info('Product stock check completed.');
    }
}
