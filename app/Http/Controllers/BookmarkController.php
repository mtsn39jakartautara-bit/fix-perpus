<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Bookmark;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    public function store(Request $request, Book $book)
    {
        $request->validate([
            'page_number' => 'required|integer|min:1',
        ]);

        $user = auth()->user();

        $bookmark = Bookmark::updateOrCreate(
            [
                'user_id' => $user->id,
                'book_id' => $book->id,
            ],
            [
                'page_number' => $request->page_number,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Bookmark berhasil disimpan',
            'page_number' => $bookmark->page_number,
        ]);
    }

    public function show(Book $book)
    {
        $user = auth()->user();

        $bookmark = Bookmark::where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->first();

        return response()->json([
            'has_bookmark' => !is_null($bookmark),
            'page_number' => $bookmark?->page_number,
        ]);
    }

    public function destroy(Book $book)
    {
        $user = auth()->user();

        $bookmark = Bookmark::where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->first();

        if ($bookmark) {
            $bookmark->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Bookmark berhasil dihapus',
        ]);
    }
}
