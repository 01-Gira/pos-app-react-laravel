<?php

namespace App\Imports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;

class ProductsImport implements ToModel, WithHeadingRow, SkipsEmptyRows, WithValidation
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        return new Product([
            'barcode' => trim($row['barcode']),
            'product_name' => $row['name'],
            'category_id' => $row['category'],
            'stock' => $row['stock'],
            'price' => $row['price']
        ]);
    }

    public function rules(): array
    {
        return [
            'barcode' => 'required|numeric|min:12|unique:'.Product::class,
            'name' => 'required|string|max:225',
            'category' => 'required|uuid',
            'stock' => 'required|numeric',
            'price' => 'required|numeric'
        ];
    }
}
