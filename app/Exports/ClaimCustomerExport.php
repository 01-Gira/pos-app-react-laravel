<?php

namespace App\Exports;

use App\Models\ClaimCustomer;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Contracts\Queue\ShouldQueue;

class ClaimCustomerExport implements FromCollection, WithHeadings, WithChunkReading, ShouldQueue
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
        return ClaimCustomer::select(
                'claim_customers.id',
                'claim_customers.transaction_id',
                'products.product_name',
                'claim_customers.description',
                'claim_customers.quantity',
                'claim_customers.status',
                'claim_customers.created_at as claim_created_at'
            )
            ->leftJoin('products', 'claim_customers.product_id', '=', 'products.id')
            ->when(isset($this->filters['search']), function ($query) {
                $search = $this->filters['search'];
                return $query->where('claim_customers.transaction_id', 'like', "%$search%")
                             ->orWhere('claim_customers.status', 'like', "%$search%")
                             ->orWhereHas('product', function ($query) use ($search) {
                                $query->where('products.product_name', 'like', "%$search%");
                            });
            })
            ->when(isset($this->filters['start_date']), function ($query) {
                return $query->whereDate('claim_customers.created_at', '>=', $this->filters['start_date']);
            })
            ->when(isset($this->filters['end_date']), function ($query) {
                return $query->whereDate('claim_customers.created_at', '<=', $this->filters['end_date']);
            })
            ->when(isset($this->filters['status']), function ($query) {
                return $query->where('claim_customers.status', $this->filters['status']);
            })
            ->orderByDesc('claim_customers.created_at')
            ->get();
    }


     /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID',
            'Transaction ID',
            'Product Name',
            'Description',
            'Quantity',
            'Status',
            'Created Date'
        ];
    }

    public function chunkSize(): int
    {
        return 500;
    }
}
