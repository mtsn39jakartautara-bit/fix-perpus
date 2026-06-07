<?php

namespace Database\Seeders;

use App\Models\Book;
use Illuminate\Database\Seeder;


class BookSeeder extends Seeder
{
    public function run(): void
    {


        $books = [
            [
                'title' => 'Pemrograman Laravel 11',
                'publisher' => 'Penerbit Informatika',
                'author' => 'Sandhika Galih',
                'publish_year' => 2024,
                'abstract' => 'Buku ini membahas tentang pemrograman Laravel dari dasar hingga mahir',
                'pdf_file' => 'books/pdfs/c9h2NHHcygbYtDo8hB5hvgtHPV7XpXUJZFYs5dMM.pdf',
                'reading_duration' => 1
            ],
            [
                'title' => 'Matematika Diskrit',
                'publisher' => 'Erlangga',
                'author' => 'Rinaldi Munir',
                'publish_year' => 2023,
                'abstract' => 'Buku matematika diskrit untuk perguruan tinggi',
                'pdf_file' => 'books/pdfs/HleBQraey4LbgGHxvn0Q6q8qAAMrvd1z5tjn0W2t.pdf',
                'reading_duration' => 1
            ],
            [
                'title' => 'Bahasa Inggris untuk Pemula',
                'publisher' => 'Gramedia',
                'author' => 'John Smith',
                'publish_year' => 2023,
                'abstract' => 'Belajar bahasa Inggris dengan mudah dan cepat',
                'pdf_file' => 'books/pdfs/oo2nP1wbIfDRDQ7x3P5yYqZtIbyAMLo8bhrfybF7.pdf',
                'reading_duration' => 1
            ],
            [
                'title' => 'Fisika Dasar',
                'publisher' => 'Yrama Widya',
                'author' => 'Marthen Kanginan',
                'publish_year' => 2022,
                'abstract' => 'Konsep fisika dasar untuk SMA dan mahasiswa',
                'pdf_file' => 'books/pdfs/s2mWBFGbmrDsHFAItPh6IPW0o8zazfb2AorrRqAU.pdf',
                'reading_duration' => 1
            ],
            [
                'title' => 'Sejarah Indonesia',
                'publisher' => 'Kemendikbud',
                'author' => 'Tim Kemendikbud',
                'publish_year' => 2023,
                'abstract' => 'Buku sejarah Indonesia lengkap',
                'pdf_file' => 'books/pdfs/Tt7PHRS7kGnysWh7YxghTO77GKuB96T5qZJ2kHU3.pdf',
                'reading_duration' => 1
            ],
        ];

        foreach ($books as $book) {
            Book::create($book);
        }
    }
}
