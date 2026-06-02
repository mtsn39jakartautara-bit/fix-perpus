<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Database\Seeder;

class WishlistSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::get();
        $books = Book::take(10)->get();

        foreach ($users as $user) {
            // Setiap user mewishlist 3-5 buku random
            $randomBooks = $books->random(rand(3, 5));

            foreach ($randomBooks as $index => $book) {
                Wishlist::create([
                    'user_id' => $user->id,
                    'book_id' => $book->id,
                    'notes' => $index === 0 ? 'Buku rekomendasi guru' : null,
                    'priority' => rand(1, 5),
                ]);
            }
        }
    }
}
