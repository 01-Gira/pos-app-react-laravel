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
}
