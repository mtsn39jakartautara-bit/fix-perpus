<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BookCategorySeeder extends Seeder
{
    public function run(): void
    {
        // Clear table terlebih dahulu
        DB::table('book_category')->truncate();

        $books = Book::all();
        $categories = Category::all();

        // Assign categories ke books
        $assignments = [
            1 => [1, 3, 5], // Book 1: Fiksi, Pendidikan, Teknologi
            2 => [2, 3],     // Book 2: Non-Fiksi, Pendidikan
            3 => [2, 3],     // Book 3: Non-Fiksi, Pendidikan
            4 => [2, 4],     // Book 4: Non-Fiksi, Sains
            5 => [2, 6],     // Book 5: Non-Fiksi, Sejarah
        ];

        foreach ($assignments as $bookId => $categoryIds) {
            $book = $books->find($bookId);
            if ($book) {
                $book->categories()->attach($categoryIds);
            }
        }
    }
}
