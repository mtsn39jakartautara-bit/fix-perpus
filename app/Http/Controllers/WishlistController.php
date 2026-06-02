<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WishlistController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Ambil semua wishlist user dengan relasi book dan categories
        $wishlists = Wishlist::with(['book.categories'])
            ->where('user_id', $user->id)
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($wishlist) {
                return [
                    'id' => $wishlist->id,
                    'notes' => $wishlist->notes,
                    'priority' => $wishlist->priority,
                    'priority_label' => $wishlist->priority_label,
                    'created_at' => $wishlist->created_at,
                    'book' => [
                        'id' => $wishlist->book->id,
                        'uuid' => $wishlist->book->uuid,
                        'title' => $wishlist->book->title,
                        'author' => $wishlist->book->author,
                        'publisher' => $wishlist->book->publisher,
                        'publish_year' => $wishlist->book->publish_year,
                        'abstract' => $wishlist->book->abstract,
                        'categories' => $wishlist->book->categories,
                        'wishlist_count' => $wishlist->book->wishlist_count ?? 0,
                    ],
                ];
            });

        // Statistik wishlist
        $stats = [
            'total' => $wishlists->count(),
            'high_priority' => $wishlists->where('priority', '>=', 4)->count(),
            'medium_priority' => $wishlists->where('priority', 3)->count(),
            'low_priority' => $wishlists->where('priority', '<=', 2)->count(),
        ];

        // Rekomendasi buku berdasarkan kategori dari wishlist
        $recommendations = $this->getRecommendations($wishlists);

        return Inertia::render('Wishlist/Index', [
            'wishlists' => $wishlists,
            'stats' => $stats,
            'recommendations' => $recommendations,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:books,id',
            'notes' => 'nullable|string|max:500',
            'priority' => 'nullable|integer|min:1|max:5',
        ]);

        $user = auth()->user();

        // Cek apakah sudah ada di wishlist
        $exists = Wishlist::where('user_id', $user->id)
            ->where('book_id', $request->book_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Buku sudah ada di wishlist Anda.'
            ], 400);
        }

        $wishlist = Wishlist::create([
            'user_id' => $user->id,
            'book_id' => $request->book_id,
            'notes' => $request->notes,
            'priority' => $request->priority ?? 3,
        ]);

        return redirect()->route('wishlist.index')->with('success', 'Buku berhasil ditambahkan ke wishlist!');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'notes' => 'nullable|string|max:500',
            'priority' => 'required|integer|min:1|max:5',
        ]);

        dd($request->all());
        $wishlist = Wishlist::where('user_id', auth()->id())->findOrFail($id);



        $wishlist->update([
            'notes' => $request->notes,
            'priority' => $request->priority,
        ]);

        return redirect()->route('wishlist.index')->with('success', 'Wishlist berhasil diperbarui!');
    }

    public function destroy($id)
    {


        $wishlist = Wishlist::where('user_id', auth()->id())->findOrFail($id);
        $wishlist->delete();

        return redirect()->route('wishlist.index')->with('success', 'Wishlist berhasil dihapus!');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:wishlists,id',
        ]);

        Wishlist::where('user_id', auth()->id())
            ->whereIn('id', $request->ids)
            ->delete();

        return redirect()->route('wishlist.index')->with('success', 'Wishlist berhasil dihapus!');
    }

    private function getRecommendations($wishlists)
    {
        // Ambil kategori dari buku yang diwishlist
        $categoryIds = collect();
        foreach ($wishlists as $wishlist) {
            foreach ($wishlist['book']['categories'] as $category) {
                $categoryIds->push($category['id']);
            }
        }

        $uniqueCategoryIds = $categoryIds->unique()->take(3);

        if ($uniqueCategoryIds->isEmpty()) {
            return [];
        }

        // Rekomendasi buku berdasarkan kategori yang sama
        $recommendedBooks = Book::with('categories')
            ->whereHas('categories', function ($query) use ($uniqueCategoryIds) {
                $query->whereIn('categories.id', $uniqueCategoryIds);
            })
            ->whereNotIn('id', collect($wishlists)->pluck('book.id'))
            ->limit(4)
            ->get()
            ->map(function ($book) {
                return [
                    'id' => $book->id,
                    'uuid' => $book->uuid,
                    'title' => $book->title,
                    'author' => $book->author,
                    'categories' => $book->categories,
                ];
            });

        return $recommendedBooks;
    }
}
