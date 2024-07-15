<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PurchaseDetail extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['purchase_id', 'product_id', 'quantity', 'discount', 'price', 'total_price'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }

    public function scopeFilter($query, array $filters)
    {
        return $query
        ->when(isset($filters['start_date']), function ($query) use ($filters) {
            return $query->whereDate('purchase_details.created_at', '>=', $filters['start_date']);
        })
        ->when(isset($filters['end_date']), function ($query) use ($filters) {
            return $query->whereDate('purchase_details.created_at', '<=', $filters['end_date']);
        });
    }
}
