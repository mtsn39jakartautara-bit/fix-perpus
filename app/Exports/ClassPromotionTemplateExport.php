<?php
// app/Exports/ClassPromotionTemplateExport.php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ClassPromotionTemplateExport implements FromArray, WithHeadings, WithStyles
{
    private $actionType;

    public function __construct($actionType = 'promote')
    {
        $this->actionType = $actionType;
    }

    public function array(): array
    {
        return [
            ['1234567890'],
            ['1234567891'],
            ['1234567892'],
            ['1234567893'],
            ['1234567894'],
        ];
    }

    public function headings(): array
    {
        return [
            'NIS',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}
