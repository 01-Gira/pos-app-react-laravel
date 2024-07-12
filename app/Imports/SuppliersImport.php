<?php

namespace App\Imports;

use App\Models\Supplier;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;

class SuppliersImport implements ToModel, WithHeadingRow, SkipsEmptyRows, WithValidation
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        return new Supplier([
            'uniq_code' => $row['uniq_code'],
            'supplier_name' => $row['name'],
            'address' => $row['address'],
            'phone_no' => $row['phone']
        ]);
    }

    public function rules(): array
    {
        return [
            'uniq_code' => 'required|string|unique:'.Supplier::class,
            'name' => 'required|string|max:225',
            'address' => 'required|string|max:255',
            'phone' => 'required|numeric|min:11'
        ];
    }
}
