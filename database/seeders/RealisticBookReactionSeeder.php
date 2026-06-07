<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Reaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RealisticBookReactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil buku pertama
        $book = Book::first();

        if (!$book) {
            $this->command->error('Buku tidak ditemukan!');
            return;
        }

        // Data reaction untuk setiap user
        $reactions = [
            'like' => [1, 2, 3, 4, 5],     // User ID 1-5 like
            'love' => [6, 7, 8],             // User ID 6-8 love
            'haha' => [9, 10],               // User ID 9-10 haha
            'sad' => [11, 12],               // User ID 11-12 sad
            'angry' => [13, 14],                 // User ID 13 angry
        ];

        foreach ($reactions as $type => $userIds) {
            foreach ($userIds as $userId) {
                Reaction::updateOrCreate(
                    [
                        'user_id' => $userId,
                        'book_id' => $book->id,
                    ],
                    ['type' => $type]
                );
            }
        }

        $this->command->info('Seeder reaction berhasil dijalankan!');

        // Tampilkan statistik
        $stats = Reaction::where('book_id', $book->id)
            ->select('type', DB::raw('count(*) as total'))
            ->groupBy('type')
            ->get();

        foreach ($stats as $stat) {
            $this->command->info("{$stat->type}: {$stat->total} reactions");
        }
    }
}
