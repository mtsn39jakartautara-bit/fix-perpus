<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $books = Book::with('categories')
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%")
                    ->orWhere('publisher', 'like', "%{$search}%");
            })
            ->when($request->category, function ($query, $category) {
                $query->whereHas('categories', function ($q) use ($category) {
                    $q->where('categories.id', $category);
                });
            })
            ->orderBy($request->sort ?? 'created_at', $request->direction ?? 'desc')
            ->paginate(12)
            ->withQueryString();

        $categories = Category::orderBy('name')->get();

        return Inertia::render('Admin/Books/Digital/Index', [
            'books' => $books,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'sort', 'direction']),
        ]);
    }

    public function create()
    {
        $categories = Category::orderBy('name')->get();

        return Inertia::render('Admin/Books/Digital/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'nullable|string|max:255',
            'publisher' => 'nullable|string|max:255',
            'publish_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'abstract' => 'nullable|string',
            'pdf_file' => 'nullable|file|mimes:pdf|max:10240', // Max 10MB
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ]);

        $book = new Book();
        $book->uuid = Str::uuid();
        $book->title = $validated['title'];
        $book->author = $validated['author'];
        $book->publisher = $validated['publisher'];
        $book->publish_year = $validated['publish_year'];
        $book->abstract = $validated['abstract'];

        if ($request->hasFile('pdf_file')) {
            $path = $request->file('pdf_file')->store('books/pdfs', 'public');
            $book->pdf_file = $path;
        }

        $book->save();

        if (!empty($validated['categories'])) {
            $book->categories()->sync($validated['categories']);
        }

        return redirect()->route('admin.books.digital.index')
            ->with('success', 'Buku digital berhasil ditambahkan');
    }

    public function edit(Book $digital)
    {
        $digital->load('categories');
        $categories = Category::orderBy('name')->get();

        return Inertia::render('Admin/Books/Digital/Edit', [
            'book' => $digital,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Book $digital)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'nullable|string|max:255',
            'publisher' => 'nullable|string|max:255',
            'publish_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'abstract' => 'nullable|string',
            'pdf_file' => 'nullable|file|mimes:pdf|max:10240',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ]);

        $digital->title = $validated['title'];
        $digital->author = $validated['author'];
        $digital->publisher = $validated['publisher'];
        $digital->publish_year = $validated['publish_year'];
        $digital->abstract = $validated['abstract'];

        if ($request->hasFile('pdf_file')) {
            // Delete old file
            if ($digital->pdf_file && Storage::disk('public')->exists($digital->pdf_file)) {
                Storage::disk('public')->delete($digital->pdf_file);
            }
            $path = $request->file('pdf_file')->store('books/pdfs', 'public');
            $digital->pdf_file = $path;
        }

        $digital->save();

        if (!empty($validated['categories'])) {
            $digital->categories()->sync($validated['categories']);
        } else {
            $digital->categories()->detach();
        }

        return redirect()->route('admin.books.digital.index')
            ->with('success', 'Buku digital berhasil diperbarui');
    }

    public function destroy(Book $digital)
    {
        // Delete PDF file
        if ($digital->pdf_file && Storage::disk('public')->exists($digital->pdf_file)) {
            Storage::disk('public')->delete($digital->pdf_file);
        }

        $digital->delete();

        return redirect()->route('admin.books.digital.index')
            ->with('success', 'Buku digital berhasil dihapus');
    }
}
