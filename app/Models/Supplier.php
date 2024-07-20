<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;


class Supplier extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['supplier_name', 'phone_no','address'];

}
