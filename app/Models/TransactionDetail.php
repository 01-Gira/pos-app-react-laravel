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

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function scopeFilter($query, array $filters)
    {
        return $query
        ->when(isset($filters['start_date']), function ($query) use ($filters) {
            return $query->whereDate('transaction_details.created_at', '>=', $filters['start_date']);
        })
        ->when(isset($filters['end_date']), function ($query) use ($filters) {
            return $query->whereDate('transaction_details.created_at', '<=', $filters['end_date']);
        });
    }
}
