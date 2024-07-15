<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;


class Purchase extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['purchase_date', 'supplier_id','payment_method', 'total_amount', 'ppn'];

    public function purchaseDetails()
    {
        return $this->hasMany(PurchaseDetail::class);
    }


    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function scopeFilter($query, array $filters)
    {
        return $query
        ->when(isset($filters['search']), function ($query) use ($filters) {
            return $query->where('id', 'like', "%{$filters['search']}%")
                ->orWhere('status', 'like', "%{$filters['search']}%");
        })
        ->when(isset($filters['start_date']), function ($query) use ($filters) {
            return $query->whereDate('purchase_date', '>=', $filters['start_date']);
        })
        ->when(isset($filters['end_date']), function ($query) use ($filters) {
            return $query->whereDate('purchase_date', '<=', $filters['end_date']);
        })
        ->when(isset($filters['status']), function ($query) use ($filters) {
            return $query->where('status', $filters['status']);
        })
        ->when(isset($filters['payment_method']), function ($query) use ($filters) {
            return $query->where('payment_method', $filters['payment_method']);
        })
        ->when(isset($filters['category']), function ($query) use ($filters) {
            return $query->whereHas('purchaseDetails.product.category', function ($query) use ($filters) {
                $query->where('id', $filters['category']);
            });
        })
        ->with('purchaseDetails.product.category')
        ->with('supplier')
        ->orderByDesc('purchase_date');
    }
}
