<?php
// app/Exports/ExternalsTemplateExport.php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ExternalsTemplateExport implements FromArray, WithHeadings, WithStyles
{
    public function array(): array
    {
        return [
            [
                'Budi Santoso',
                '3175010101900001',
                'male',
                '081234567890',
            ],
            [
                'Siti Rahayu',
                '3175020202910002',
                'female',
                '081234567891',
            ],
            [
                'Ahmad Fauzi',
                '3175030303920003',
                'male',
                '081234567892',
            ],
            [
                'Dewi Lestari',
                '3175040404930004',
                'female',
                '081234567893',
            ],
            [
                'Rizki Pratama',
                '3175050505940005',
                'male',
                '081234567894',
            ],
        ];
    }

    public function headings(): array
    {
        return [
            'NAMA',
            'NIK',
            'JENIS_KELAMIN',
            'NO_HP',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}
