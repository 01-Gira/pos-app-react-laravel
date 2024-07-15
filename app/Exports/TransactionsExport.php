<?php

namespace App\Exports;

use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Contracts\Queue\ShouldQueue;

class TransactionsExport implements FromCollection, WithHeadings, WithChunkReading, ShouldQueue
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
        return Transaction::select('id', 'transaction_date', 'payment_method', 'subtotal', 'ppn', 'total_payment', 'status')
        ->filter($this->filters)->get();
    }


    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'Transaction ID',
            'Transaction Date',
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
