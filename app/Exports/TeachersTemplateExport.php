<?php
// app/Exports/TeachersTemplateExport.php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TeachersTemplateExport implements FromArray, WithHeadings, WithStyles
{
    public function array(): array
    {
        return [
            [
                'Dr. Ahmad Hidayat, M.Pd',
                '198001012005011001',
                'Matematika',
                '081234567890',
                'Jl. Pendidikan No. 123, Jakarta',
            ],
            [
                'Dewi Sartika, S.Pd',
                '198502152008012002',
                'Bahasa Indonesia',
                '081234567891',
                'Jl. Merdeka No. 45, Bandung',
            ],
            [
                'Budi Santoso, S.Si',
                '198703102010011003',
                'Fisika',
                '081234567892',
                'Jl. Raya No. 78, Surabaya',
            ],
            [
                'Siti Aminah, S.Pd',
                '199001202012012004',
                'Bahasa Inggris',
                '081234567893',
                'Jl. Mawar No. 9, Semarang',
            ],
            [
                'Rizky Pratama, S.Kom',
                '199205152014011005',
                'Informatika',
                '081234567894',
                'Jl. Kenangan No. 10, Yogyakarta',
            ],
        ];
    }

    public function headings(): array
    {
        return [
            'NAMA',
            'NIP',
            'MATA_PELAJARAN',
            'NO_HP',
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
