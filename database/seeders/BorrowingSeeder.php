<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\BookItem;
use App\Models\Borrowing;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class BorrowingSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::whereIn('role', ['student', 'teacher'])->get();
        $bookItems = BookItem::where('status', 'available')->get();

        // Create some borrowings
        $borrowings = [
            [
                'user_id' => 2, // Teacher Budi
                'book_item_id' => 1,
                'borrowed_at' => Carbon::now()->subDays(5),
                'due_date' => Carbon::now()->addDays(2),
                'status' => 'borrowed',
                'fine_amount' => 0,
                'fine_paid' => false,
            ],
            [
                'user_id' => 3, // Teacher Siti
                'book_item_id' => 2,
                'borrowed_at' => Carbon::now()->subDays(3),
                'due_date' => Carbon::now()->addDays(4),
                'status' => 'borrowed',
                'fine_amount' => 0,
                'fine_paid' => false,
            ],
            [
                'user_id' => 4, // Student Citra
                'book_item_id' => 3,
                'borrowed_at' => Carbon::now()->subDays(10),
                'due_date' => Carbon::now()->subDays(3),
                'returned_at' => Carbon::now()->subDays(2),
                'status' => 'returned',
                'fine_amount' => 5000,
                'fine_paid' => true,
            ],
            [
                'user_id' => 5, // Student Andini
                'book_item_id' => 4,
                'borrowed_at' => Carbon::now()->subDays(2),
                'due_date' => Carbon::now()->addDays(5),
                'status' => 'borrowed',
                'fine_amount' => 0,
                'fine_paid' => false,
            ],
        ];

        foreach ($borrowings as $borrowing) {
            Borrowing::create($borrowing);

            // Update book item status
            $bookItem = BookItem::find($borrowing['book_item_id']);
            if ($borrowing['status'] == 'borrowed') {
                $bookItem->update(['status' => 'borrowed']);
            } elseif ($borrowing['status'] == 'returned') {
                $bookItem->update(['status' => 'available']);
            }
        }
    }
}
