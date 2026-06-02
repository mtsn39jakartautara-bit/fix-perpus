<?php
// app/Exports/StudentStatusTemplateExport.php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StudentStatusTemplateExport implements FromArray, WithHeadings, WithStyles
{
    private $status;

    public function __construct($status = 'transferred')
    {
        $this->status = $status;
    }

    public function array(): array
    {
        return [
            ['1234567890', 'Catatan: Siswa pindah ke sekolah lain'],
            ['1234567891', 'Catatan: Siswa drop out karena alasan kesehatan'],
            ['1234567892', ''],
            ['1234567893', ''],
            ['1234567894', ''],
        ];
    }

    public function headings(): array
    {
        return [
            'NIS',
            'CATATAN (Opsional)',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}
