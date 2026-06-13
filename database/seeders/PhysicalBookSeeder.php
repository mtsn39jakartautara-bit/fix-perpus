<?php

namespace Database\Seeders;

use App\Models\PhysicalBook;
use Illuminate\Database\Seeder;

class PhysicalBookSeeder extends Seeder
{
    public function run(): void
    {
        $physicalBooks = [
            [
                'title' => 'Pemrograman Web dengan PHP',
                'isbn' => '978-602-04-1234-5',
                'publisher' => 'Informatika',
                'author' => 'Sandhika Galih',
                'location_rack' => 'RAK-01-A',
                'publish_year' => 2023,
                'abstract' => 'Buku pemrograman web menggunakan PHP',
                'stock' => 5,
            ],
            [
                'title' => 'Database Design',
                'isbn' => '978-602-04-1235-2',
                'publisher' => 'Andi Offset',
                'author' => 'Rosa A.S.',
                'location_rack' => 'RAK-01-B',
                'publish_year' => 2022,
                'abstract' => 'Perancangan database yang baik',
                'stock' => 3,
            ],
            // [
            //     'title' => 'Jaringan Komputer',
            //     'isbn' => '978-602-04-1236-9',
            //     'publisher' => 'Erlangga',
            //     'author' => 'Todd Lammle',
            //     'location_rack' => 'RAK-02-A',
            //     'publish_year' => 2023,
            //     'abstract' => 'Panduan lengkap jaringan komputer',
            //     'stock' => 4,
            // ],
            // [
            //     'title' => 'Algoritma dan Pemrograman',
            //     'isbn' => '978-602-04-1237-6',
            //     'publisher' => 'Gramedia',
            //     'author' => 'Jong Jek Siang',
            //     'location_rack' => 'RAK-02-B',
            //     'publish_year' => 2022,
            //     'abstract' => 'Dasar algoritma pemrograman',
            //     'stock' => 6,
            // ],
            // [
            //     'title' => 'English Grammar',
            //     'isbn' => '978-602-04-1238-3',
            //     'publisher' => 'Oxford Press',
            //     'author' => 'Betty Azar',
            //     'location_rack' => 'RAK-03-A',
            //     'publish_year' => 2023,
            //     'abstract' => 'Tata bahasa Inggris lengkap',
            //     'stock' => 3,
            // ],
        ];

        foreach ($physicalBooks as $book) {
            PhysicalBook::create($book);
        }
    }
}
