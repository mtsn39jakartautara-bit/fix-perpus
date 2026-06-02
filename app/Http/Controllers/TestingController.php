<?php

namespace App\Http\Controllers;

use App\Models\BookItem;
use App\Models\LibraryCheckPoint;
use App\Models\User;
use Inertia\Inertia;

class TestingController extends Controller
{
    public function user()
    {
        $users = User::query()
            ->select([
                'id',
                'name',
                'barcode',
            ])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'barcode' => $user->barcode,
                ];
            });

        return Inertia::render('Test/User', [
            'users' => $users,
        ]);
    }
    public function buku()
    {
        $books = BookItem::with('physicalBook')
            ->get()
            ->map(function ($book) {
                return [
                    'id' => $book->id,
                    'barcode' => $book->barcode,
                    'physical_book_id' => $book->physical_book_id,
                    'book_title' => $book->physicalBook?->title,
                    'book_author' => $book->physicalBook?->author,
                    'status' => $book->status,
                ];
            });

        return Inertia::render('Test/Buku', [
            'books' => $books,
        ]);
    }
    public function visit()
    {
        // kunjungan sisi user
        $rooms = LibraryCheckPoint::all()->map(function ($room) {

            return [
                'id' => $room->id,
                'name' => $room->name,
                'barcode' => $room->barcode,


            ];
        });

        return Inertia::render('Test/Visit', [
            'rooms' => $rooms,
        ]);
    }


    public function test()
    {
        return redirect()->back()->with('success', 'Berhasil test');
    }
}
