<?php

namespace App\Imports;

use App\Models\Supplier;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\Importable;
use Illuminate\Support\Str;


class SuppliersImport implements ToModel, WithHeadingRow, WithValidation, SkipsEmptyRows, SkipsOnFailure
{
    use Importable, SkipsFailures;

    private $originalRow;

    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        return new Supplier([
            'supplier_name' => $this->originalRow['supplier_name'],
            'address' => $row['address'],
            'phone_no' => $row['phone']
        ]);
    }

    public function rules(): array
    {
        return [
            'supplier_name' => 'required|string|max:225|unique:'.Supplier::class,
            'address' => 'required|max:255',
            'phone' => 'required|numeric|min:11'
        ];
    }

    public function prepareForValidation(array $data)
    {
        $this->originalRow = $data; // Simpan nilai asli
        $data['supplier_name'] = Str::lower($data['supplier_name']);
        return $data;
    }


    public function customValidationMessages()
    {
        return [
            'supplier_name.required' => 'Name is required',
            'supplier_name.unique' => 'Name is already exist',
            'phone.required' => 'Phone is required',
            'phone.numeric' => 'Phone must be a number',
            'address.required' => 'Address is required'
        ];
    }
}
