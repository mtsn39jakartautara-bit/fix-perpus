<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PhysicalBook;
use App\Models\BookItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PhysicalBookController extends Controller
{
    public function index(Request $request)
    {
        $books = PhysicalBook::withCount(['bookItems' => function ($query) {
            $query->where('status', 'available');
        }])
            ->withCount('bookItems as total_items')
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%")
                    ->orWhere('isbn', 'like', "%{$search}%")
                    ->orWhere('publisher', 'like', "%{$search}%");
            })
            ->when($request->status === 'available', function ($query) {
                $query->has('bookItems', '>', 0);
            })
            ->when($request->status === 'unavailable', function ($query) {
                $query->doesntHave('bookItems');
            })
            ->orderBy($request->sort ?? 'created_at', $request->direction ?? 'desc')
            ->paginate(12)
            ->withQueryString();;

        $books->through(function ($book) {
            $book->total_items = (int) $book->total_items;
            $book->book_items_count = (int) $book->book_items_count;

            // Bonus: cast stock juga jika perlu
            $book->stock = (int) $book->stock;

            return $book;
        });




        return Inertia::render('Admin/Books/Physical/Index', [
            'books' => $books,
            'filters' => $request->only(['search', 'status', 'sort', 'direction']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Books/Physical/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'isbn' => 'nullable|string|max:20|unique:physical_books,isbn',
            'author' => 'nullable|string|max:255',
            'publisher' => 'nullable|string|max:255',
            'location_rack' => 'nullable|string|max:100',
            'publish_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'abstract' => 'nullable|string',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'stock' => 'nullable|integer|min:0',
        ]);

        $book = new PhysicalBook();
        $book->title = $validated['title'];
        $book->isbn = $validated['isbn'] ?? null;
        $book->author = $validated['author'] ?? null;
        $book->publisher = $validated['publisher'] ?? null;
        $book->location_rack = $validated['location_rack'] ?? null;
        $book->publish_year = $validated['publish_year'] ?? null;
        $book->abstract = $validated['abstract'] ?? null;
        $book->stock = $validated['stock'] ?? 0;

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('books/covers', 'public');
            $book->cover_image = $path;
        }

        $book->save();

        // Create book items based on stock
        if ($book->stock > 0) {
            for ($i = 1; $i <= $book->stock; $i++) {
                BookItem::create([
                    'physical_book_id' => $book->id,
                    'barcode' => $this->generateBarcode($book->id, $i),
                    'status' => 'available',
                ]);
            }
        }

        return redirect()->route('admin.books.physical.index')
            ->with('success', 'Buku fisik berhasil ditambahkan');
    }

    public function show(PhysicalBook $physical)
    {
        $physical->load(['bookItems' => function ($query) {
            $query->with('borrowings');
        }]);


        $items = $physical->bookItems()->paginate(10);


        $stats = [
            'total' => $physical->bookItems()->count(),
            'available' => $physical->bookItems()->where('status', 'available')->count(),
            'borrowed' => $physical->bookItems()->where('status', 'borrowed')->count(),
            'lost' => $physical->bookItems()->where('status', 'lost')->count(),
            'damaged' => $physical->bookItems()->where('status', 'damaged')->count(),
        ];

        return Inertia::render('Admin/Books/Physical/Show', [
            'book' => $physical,
            'items' => $items,
            'stats' => $stats,
        ]);
    }

    public function edit(PhysicalBook $physical)
    {
        return Inertia::render('Admin/Books/Physical/Edit', [
            'book' => $physical,
        ]);
    }

    public function update(Request $request, PhysicalBook $physical)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'isbn' => 'nullable|string|max:20|unique:physical_books,isbn,' . $physical->id,
            'author' => 'nullable|string|max:255',
            'publisher' => 'nullable|string|max:255',
            'location_rack' => 'nullable|string|max:100',
            'publish_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'abstract' => 'nullable|string',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $physical->title = $validated['title'];
        $physical->isbn = $validated['isbn'] ?? null;
        $physical->author = $validated['author'] ?? null;
        $physical->publisher = $validated['publisher'] ?? null;
        $physical->location_rack = $validated['location_rack'] ?? null;
        $physical->publish_year = $validated['publish_year'] ?? null;
        $physical->abstract = $validated['abstract'] ?? null;

        if ($request->hasFile('cover_image')) {
            if ($physical->cover_image && Storage::disk('public')->exists($physical->cover_image)) {
                Storage::disk('public')->delete($physical->cover_image);
            }
            $path = $request->file('cover_image')->store('books/covers', 'public');
            $physical->cover_image = $path;
        }

        $physical->save();

        return redirect()->route('admin.books.physical.index')
            ->with('success', 'Buku fisik berhasil diperbarui');
    }

    public function destroy(PhysicalBook $physical)
    {
        // Check if book has any borrowings
        if ($physical->bookItems()->where('status', 'borrowed')->exists()) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus buku yang sedang dipinjam');
        }

        // Delete cover image
        if ($physical->cover_image && Storage::disk('public')->exists($physical->cover_image)) {
            Storage::disk('public')->delete($physical->cover_image);
        }

        $physical->delete();

        return redirect()->route('admin.books.physical.index')
            ->with('success', 'Buku fisik berhasil dihapus');
    }

    private function generateBarcode($bookId, $sequence)
    {
        return 'BK-' . str_pad($bookId, 5, '0', STR_PAD_LEFT) . '-' . str_pad($sequence, 3, '0', STR_PAD_LEFT);
    }

    // Item management methods
    public function addItem(Request $request, PhysicalBook $physical)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1|max:100',
        ]);

        $currentItems = $physical->bookItems()->count();

        for ($i = 1; $i <= $request->quantity; $i++) {
            BookItem::create([
                'physical_book_id' => $physical->id,
                'barcode' => $this->generateBarcode($physical->id, $currentItems + $i),
                'status' => 'available',
            ]);
        }

        $physical->increment('stock', $request->quantity);

        return redirect()->back()->with('success', $request->quantity . ' item buku berhasil ditambahkan');
    }

    public function deleteItem(BookItem $item)
    {
        if ($item->status === 'borrowed') {
            return redirect()->back()->with('error', 'Tidak dapat menghapus item yang sedang dipinjam');
        }

        $physical = $item->physicalBook;
        $item->delete();
        $physical->decrement('stock');

        return redirect()->back()->with('success', 'Item buku berhasil dihapus');
    }

    public function updateItemStatus(Request $request, BookItem $item)
    {
        $request->validate([
            'status' => 'required|in:available,damaged, lost',
        ]);

        if ($item->status === 'borrowed' && $request->status !== 'borrowed') {
            return redirect()->back()->with('error', 'Item yang sedang dipinjam tidak dapat diubah statusnya');
        }

        $item->update(['status' => $request->status]);

        return redirect()->back()->with('success', 'Status item berhasil diperbarui');
    }
}
