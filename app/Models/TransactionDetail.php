<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;


class TransactionDetail extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['transaction_id', 'product_id', 'quantity', 'price', 'discount', 'total_price'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
