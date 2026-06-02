<?php

namespace Database\Seeders;

use App\Models\AcademicYears;
use Illuminate\Database\Seeder;

class AcademicYearSeeder extends Seeder
{
    public function run(): void
    {
        $academicYears = [
            [
                'name' => '2023/2024',
                'is_active' => false,
            ],
            [
                'name' => '2024/2025',
                'is_active' => false,
            ],
            [
                'name' => '2025/2026',
                'is_active' => true, // Tahun ajaran aktif sekarang
            ],

        ];

        foreach ($academicYears as $year) {
            AcademicYears::create($year);
        }
    }
}
