<?php

namespace App\Imports;

use App\Models\Discount;
use App\Models\Product;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;

class DiscountImport implements ToModel, WithHeadingRow, SkipsEmptyRows, WithValidation
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        $product = Product::where('barcode', (int)$row['barcode'])->firstOrFail();

        return new Discount([
            'product_id' => $product->id,
            'discount' => $row['discount']
        ]);
    }

    public function rules(): array
    {
        return [
            'product_id' => 'required|unique:'.Discount::class,
            'disctount' => 'required|numeric|max:225',
        ];
    }
}
