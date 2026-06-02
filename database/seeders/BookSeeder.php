<?php

namespace Database\Seeders;

use App\Models\Book;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class BookSeeder extends Seeder
{
    public function run(): void
    {
        $pdf = [
            'example.pdf',
            'example2.pdf',
            'example3.pdf'
        ];

        $books = [
            [
                'title' => 'Pemrograman Laravel 11',
                'publisher' => 'Penerbit Informatika',
                'author' => 'Sandhika Galih',
                'publish_year' => 2024,
                'abstract' => 'Buku ini membahas tentang pemrograman Laravel dari dasar hingga mahir',
                'pdf_file' => Arr::random($pdf),
            ],
            [
                'title' => 'Matematika Diskrit',
                'publisher' => 'Erlangga',
                'author' => 'Rinaldi Munir',
                'publish_year' => 2023,
                'abstract' => 'Buku matematika diskrit untuk perguruan tinggi',
                'pdf_file' => Arr::random($pdf),
            ],
            [
                'title' => 'Bahasa Inggris untuk Pemula',
                'publisher' => 'Gramedia',
                'author' => 'John Smith',
                'publish_year' => 2023,
                'abstract' => 'Belajar bahasa Inggris dengan mudah dan cepat',
                'pdf_file' => Arr::random($pdf),
            ],
            [
                'title' => 'Fisika Dasar',
                'publisher' => 'Yrama Widya',
                'author' => 'Marthen Kanginan',
                'publish_year' => 2022,
                'abstract' => 'Konsep fisika dasar untuk SMA dan mahasiswa',
                'pdf_file' => Arr::random($pdf),
            ],
            [
                'title' => 'Sejarah Indonesia',
                'publisher' => 'Kemendikbud',
                'author' => 'Tim Kemendikbud',
                'publish_year' => 2023,
                'abstract' => 'Buku sejarah Indonesia lengkap',
                'pdf_file' => Arr::random($pdf),
            ],
        ];

        foreach ($books as $book) {
            Book::create($book);
        }
    }
}
