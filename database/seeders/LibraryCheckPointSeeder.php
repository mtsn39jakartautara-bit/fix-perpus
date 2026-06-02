<?php

namespace Database\Seeders;

use App\Models\LibraryCheckPoint;
use Illuminate\Database\Seeder;

class LibraryCheckPointSeeder extends Seeder
{
    public function run(): void
    {
        $checkPoints = [
            ['name' => 'Pintu Masuk Utama', 'barcode' => $this->generateBarcode('Pintu Masuk Utama'), 'type' => 'library_visit'],
        ];

        foreach ($checkPoints as $point) {
            LibraryCheckPoint::create($point);
        }
    }

    private function generateBarcode(string $identifier): string
    {
        return 'MTSN39-JAKUT-' . $identifier;
    }
}
