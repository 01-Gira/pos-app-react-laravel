<?php

namespace App\Exports;

use App\Models\Purchase;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Contracts\Queue\ShouldQueue;

class PurchasesExport implements FromCollection, WithHeadings, WithChunkReading, ShouldQueue
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
        return Purchase::select('purchases.id', 'purchases.purchase_date', 'suppliers.supplier_name', 'purchases.payment_method', 'purchases.subtotal', 'purchases.ppn', 'purchases.total_payment', 'purchases.status')
        ->leftJoin('suppliers', 'purchases.supplier_id', '=', 'suppliers.id')
        ->filter($this->filters)->get();
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'Purchase ID',
            'Purchase Date',
            'Supplier Name',
            'Payment Method',
            'PPN',
            'Subtotal',
            'Total Payment',
            'Status'
        ];
    }

    public function chunkSize(): int
    {
        return 500;
    }
}
