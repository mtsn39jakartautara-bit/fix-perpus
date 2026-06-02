<?php
// app/Exports/StudentsTemplateExport.php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StudentsTemplateExport implements FromArray, WithHeadings, WithStyles
{
    public function array(): array
    {
        return [
            [
                'Ahmad Faiz Ramadhan',
                '1234567890',
                'ahmad.faiz@student.com',
                'male',
                '081234567890',
                'Jl. Pendidikan No. 123, Jakarta',
            ],
            [
                'Siti Nurhaliza',
                '1234567891',
                'siti.nurhaliza@student.com',
                'female',
                '081234567891',
                'Jl. Merdeka No. 45, Bandung',
            ],
            [
                'Budi Santoso',
                '1234567892',
                'budi.santoso@student.com',
                'male',
                '081234567892',
                'Jl. Raya No. 78, Surabaya',
            ],
            [
                'Dewi Anggraini',
                '1234567893',
                'dewi.anggraini@student.com',
                'female',
                '081234567893',
                'Jl. Mawar No. 9, Semarang',
            ],
            [
                'Rizky Pratama',
                '1234567894',
                'rizky.pratama@student.com',
                'male',
                '081234567894',
                'Jl. Kenangan No. 10, Yogyakarta',
            ],
        ];
    }

    public function headings(): array
    {
        return [
            'NAMA',
            'NIS',
            'EMAIL',
            'JENIS_KELAMIN',
            'NO_HP_ORANGTUA',
            'ALAMAT',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}
