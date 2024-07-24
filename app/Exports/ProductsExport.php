<?php

namespace App\Exports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Contracts\Queue\ShouldQueue;

class ProductsExport implements FromCollection, WithHeadings, WithChunkReading, ShouldQueue
{
    use Exportable;
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Product::select('barcode', 'product_name', 'category_id', 'stock', 'type', 'price')->get();
    }

    public function headings(): array
    {
        return [
            'Barcode',
            'Product Name',
            'Category ID',
            'Stock',
            'Type',
            'Price',
        ];
    }

    public function chunkSize(): int
    {
        return 500;
    }
}
