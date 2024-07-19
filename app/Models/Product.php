<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Product extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['barcode', 'product_name', 'category_id', 'stock', 'type', 'price', 'picture'];


    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function discount()
    {
        return $this->hasOne(Discount::class);
    }

    public function transactionDetails()
    {
        return $this->hasMany(TransactionDetail::class);
    }

    public function purchaseDetails()
    {
        return $this->hasMany(PurchaseDetail::class);
    }

    public function scopeFilter($query, array $filters)
    {
        return $query
        ->when(isset($filters['search']), function ($query) use ($filters) {
            return $query->where('product_name', 'like', "%{$filters['search']}%")
                ->orWhere('barcode', 'like', "%{$filters['search']}%");
        })
        ->when($filters['category'], function ($query, $category) {
            return $query->where('category_id', $category);
        })
        ->with('category', 'discount')
        ->orderByDesc('created_at');
    }

}
