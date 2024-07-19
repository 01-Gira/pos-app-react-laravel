<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ClaimCustomer extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['transaction_id', 'status', 'product_id', 'quantity', 'description'];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function scopeFilter($query, array $filters)
    {
        return $query
        ->when($filters['search'], function ($query, $filters) {
            return $query->where('transaction_id', 'like', "%{$filters['search']}%")
                         ->orWhere('status', 'like', "%{$filters['search']}%")
                         ->orWhere('product.product_name', 'like', "%{$filters['search']}%");
        })
        ->when(isset($filters['start_date']), function ($query) use ($filters) {
            return $query->whereDate('transaction_date', '>=', $filters['start_date']);
        })
        ->when(isset($filters['end_date']), function ($query) use ($filters) {
            return $query->whereDate('transaction_date', '<=', $filters['end_date']);
        })
        ->when($filters['status'], function ($query, $status) {
            return $query->where('status', $status);
        })
        ->with('transaction', 'product')
        ->orderByDesc('created_at');
    }
}
