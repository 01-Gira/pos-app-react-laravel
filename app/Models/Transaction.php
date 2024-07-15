<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Transaction extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['transaction_date', 'payment_method', 'total_amount', 'ppn', 'subtotal', 'status'];

    public function transactionDetails()
    {
        return $this->hasMany(TransactionDetail::class);
    }

    public function scopeFilter($query, array $filters)
    {
        return $query
        ->when(isset($filters['search']), function ($query) use ($filters) {
            return $query->where('id', 'like', "%{$filters['search']}%")
                ->orWhere('status', 'like', "%{$filters['search']}%");
        })
        ->when(isset($filters['start_date']), function ($query) use ($filters) {
            return $query->whereDate('transaction_date', '>=', $filters['start_date']);
        })
        ->when(isset($filters['end_date']), function ($query) use ($filters) {
            return $query->whereDate('transaction_date', '<=', $filters['end_date']);
        })
        ->when(isset($filters['status']), function ($query) use ($filters) {
            return $query->where('status', $filters['status']);
        })
        ->when(isset($filters['payment_method']), function ($query) use ($filters) {
            return $query->where('payment_method', $filters['payment_method']);
        })
        ->with('transactionDetails.product.category')
        ->orderByDesc('transaction_date');
    }
}
