<?php

namespace App\Imports;

use App\Models\Product;
use App\Models\Category;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\Importable;

class ProductsImport implements ToModel, WithHeadingRow, SkipsEmptyRows, WithValidation, SkipsOnFailure
{
    use Importable, SkipsFailures;

    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        $category = Category::where('category_name', $row['category'])->first();

        return new Product([
            'barcode' => trim($row['barcode']),
            'product_name' => $row['name'],
            'category_id' => $category ? $category->id : null,
            'stock' => $row['stock'],
            'type' => $row['type'],
            'price' => $row['price']
        ]);
    }

    public function rules(): array
    {
        return [
            'barcode' => 'required|numeric|unique:'.Product::class,
            'name' => 'required|string|max:225',
            'category' => 'required|string|exists:categories,category_name',
            'stock' => 'required|numeric',
            'type' => 'required|string',
            'price' => 'required|numeric'
        ];
    }

    public function customValidationMessages()
    {
        return [
            'barcode.required' => 'Barcode is required',
            'barcode.numeric' => 'Barcode must be a number',
            'barcode.unique' => 'Barcode is already exist',
            'name.required' => 'Name is required',
            'price.required' => 'Price is required',
            'price.numeric' => 'Price must be a number',
            'stock.required' => 'Stock is required',
            'stock.numeric' => 'Stock must be a number',
            'type.required' => 'Type is required',
            'category.required' => 'Category is required',
            'category.exist' => 'Category is not exist'
        ];
    }
}
