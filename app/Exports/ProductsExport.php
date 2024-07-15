<?php

namespace App\Exports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\Exportable;

class ProductsExport implements FromCollection, WithHeadings
{
    use Exportable;
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Product::select('barcode', 'product_name', 'category_id', 'stock', 'price')->get();
    }

    public function headings(): array
    {
        return [
            'Barcode',
            'Product Name',
            'Category ID',
            'Stock',
            'Price',
        ];
    }
}
