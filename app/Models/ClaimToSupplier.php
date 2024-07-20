<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ClaimToSupplier extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['purchase_id', 'supplier_id', 'product_id',  'quantity', 'description', 'status'];

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function scopeFilter($query, array $filters)
    {
        return $query
        ->when(isset($filters['search']), function ($query) use ($filters) {
            return $query->where('purchase_id', 'like', "%{$filters['search']}%")
                         ->orWhere('status', 'like', "%{$filters['search']}%")
                         ->orWhereHas('product', function ($query) use ($filters) {
                            $query->where('product_name', 'like', "%{$filters['search']}%");
                        });
        })
        ->when(isset($filters['start_date']), function ($query) use ($filters) {
            return $query->whereDate('created_at', '>=', $filters['start_date']);
        })
        ->when(isset($filters['end_date']), function ($query) use ($filters) {
            return $query->whereDate('created_at', '<=', $filters['end_date']);
        })
        ->when($filters['status'], function ($query, $status) {
            return $query->where('status', $status);
        })
        ->with('purchase', 'product')
        ->orderByDesc('created_at');
    }
}
