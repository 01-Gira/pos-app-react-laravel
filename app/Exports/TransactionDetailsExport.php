<?php

namespace App\Exports;

use App\Models\TransactionDetail;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Contracts\Queue\ShouldQueue;

class TransactionDetailsExport implements FromCollection, WithHeadings, WithChunkReading, ShouldQueue
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
        return TransactionDetail::select(
                'transaction_details.transaction_id',
                'products.product_name',
                'transaction_details.quantity',
                'transaction_details.discount',
                'transaction_details.total_price'
            )
            ->leftJoin('products', 'transaction_details.product_id', '=', 'products.id')
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
