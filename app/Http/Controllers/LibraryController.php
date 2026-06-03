<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Wishlist;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LibraryController extends Controller
{
    public function index()
    {
        $query = Book::query()->with('categories');

        // Search filter
        if (request('search')) {
            $search = request('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%")
                    ->orWhereHas('categories', function ($categoryQuery) use ($search) {
                        $categoryQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Category filter
        if (request('category')) {
            $categorySlug = request('category');
            $query->whereHas('categories', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        $books = $query->paginate(12);

        // Get all categories for filter dropdown
        $categories = \App\Models\Category::orderBy('name')->get();

        return Inertia::render('Libraries/Index', [
            'books' => $books->items(),
            'pagination' => [
                'current_page' => $books->currentPage(),
                'last_page' => $books->lastPage(),
                'per_page' => $books->perPage(),
                'total' => $books->total(),
            ],
            'totalBooks' => Book::count(),
            'categories' => $categories,
        ]);
    }
    public function show($uuid)
    {
        $book = Book::with('categories')
            ->where('uuid', $uuid)
            ->firstOrFail();

        $user = auth()->user();

        // Cek apakah buku sudah di wishlist dan ambil data wishlistnya
        $isWishlisted = false;
        $wishlistId = null;

        if ($user) {
            $wishlist = Wishlist::where('user_id', $user->id)
                ->where('book_id', $book->id)
                ->first(); // Gunakan first() bukan hanya where()

            if ($wishlist) {
                $isWishlisted = true;
                $wishlistId = $wishlist->id; // Ambil ID wishlist untuk keperluan delete
            }
        }

        // Rekomendasi buku serupa
        $recommendations = Book::with('categories')
            ->where('id', '!=', $book->id)
            ->whereHas('categories', function ($q) use ($book) {
                $q->whereIn(
                    'categories.id',
                    $book->categories->pluck('id')
                );
            })
            ->limit(4)
            ->get();


        return Inertia::render('Libraries/Show', [
            'book' => [
                'id' => $book->id,
                'uuid' => $book->uuid,
                'title' => $book->title,
                'author' => $book->author,
                'publisher' => $book->publisher,
                'publish_year' => $book->publish_year,
                'abstract' => $book->abstract,
                'categories' => $book->categories,
                'pdf_url' => $book->pdf_file
                    ? Storage::url($book->pdf_file)
                    : null,
                // 'pdf_url' => '/storage/' . $book->pdf_file,
                'is_wishlisted' => $isWishlisted,
                'wishlist_id' => $wishlistId, // Kirim wishlist_id ke frontend
            ],

            'recommendations' => $recommendations,
        ]);
    }
}
