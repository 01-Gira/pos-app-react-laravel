<?php

namespace App\Exports;

use App\Models\PurchaseDetail;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Contracts\Queue\ShouldQueue;

class PurchaseDetailsExport implements FromCollection, WithHeadings, WithChunkReading, ShouldQueue
{
    use Exportable;

    protected $filters = [];

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return PurchaseDetail::select(
            'purchase_details.purchase_id',
            'products.product_name',
            'purchase_details.quantity',
            'purchase_details.discount',
            'purchase_details.total_price'
        )
        ->leftJoin('products', 'purchase_details.product_id', '=', 'products.id')
        ->filter($this->filters)
        ->get();
    }


    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'Transaction ID',
            'Product Name',
            'Quantity',
            'Discount',
            'Total Price'
        ];
    }

    public function chunkSize(): int
    {
        return 500;
    }
}
