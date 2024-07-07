<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Transaction extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['transaction_date', 'payment_method', 'total_amount', 'ppn'];

    public function transactionDetails()
    {
        return $this->hasMany(TransactionDetail::class);
    }
}
