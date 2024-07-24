<?php

namespace App\Imports;

use App\Models\Category;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\Importable;
use Illuminate\Support\Str;

class CategoryImport implements ToModel, WithHeadingRow, SkipsEmptyRows, WithValidation, SkipsOnFailure
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
        return new Category([
            'category_name' => $this->originalRow['category_name']
        ]);
    }

    public function rules(): array
    {
        return [
            'category_name' => 'required|string|max:225|unique:'.Category::class,
        ];
    }

    public function prepareForValidation(array $data)
    {
        $this->originalRow = $data; // Simpan nilai asli
        $data['category_name'] = Str::lower($data['category_name']);
        return $data;
    }

    public function customValidationMessages()
    {
        return [
            'category_name.string' => 'Category Name must be a string or text',
            'category_name.unique' => 'Category Name is already exist',
        ];
    }
}
