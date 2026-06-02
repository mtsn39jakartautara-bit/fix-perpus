<?php

namespace Database\Seeders;

use App\Models\PhysicalBook;
use App\Models\BookItem;
use Illuminate\Database\Seeder;

class BookItemSeeder extends Seeder
{
    public function run(): void
    {
        $physicalBooks = PhysicalBook::all();

        foreach ($physicalBooks as $book) {
            // Create book items berdasarkan stock
            for ($i = 1; $i <= $book->stock; $i++) {
                BookItem::create([
                    'barcode' => $this->generateBarcode(str_pad($book->id, 3, '0', STR_PAD_LEFT) . '-' . str_pad($i, 2, '0', STR_PAD_LEFT)),
                    'physical_book_id' => $book->id,
                    'status' => 'available',
                ]);
            }
        }

        // Tambah beberapa book item yang statusnya borrowed untuk sample
        $borrowedItems = BookItem::where('status', 'available')->take(3)->get();
        foreach ($borrowedItems as $item) {
            $item->update(['status' => 'borrowed']);
        }
    }

    private function generateBarcode(string $identifier): string
    {
        return 'MTSN39-JAKUT-' . $identifier;
    }
}
