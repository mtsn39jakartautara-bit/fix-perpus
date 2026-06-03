<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BookItem;
use App\Models\Borrowing;
use App\Models\PointHistory;
use App\Models\PointPeriods;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class BorrowingController extends Controller
{
    /**
     * Tampilkan halaman peminjaman
     */
    public function index()
    {
        return inertia('Admin/Borrowings/Index');
    }

    /**
     * Cari user berdasarkan barcode atau NIS/NIP/email
     */
    public function findUser(Request $request)
    {
        $request->validate([
            'search' => 'required|string',
        ]);

        $search = $request->search;

        // Cari user
        $user = User::with(['student', 'teacher'])
            ->where('barcode', $search)
            ->orWhere('email', $search)
            ->orWhereHas('student', function ($query) use ($search) {
                $query->where('nis', $search);
            })
            ->orWhereHas('teacher', function ($query) use ($search) {
                $query->where('nip', $search);
            })
            ->first();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        // Cek keterlambatan
        $hasLateBorrowings = Borrowing::where('user_id', $user->id)
            ->where('status', 'borrowed')
            ->where('due_date', '<', now())
            ->exists();

        // Hitung jumlah pinjaman aktif
        $currentBorrowings = Borrowing::where('user_id', $user->id)
            ->where('status', 'borrowed')
            ->count();

        // Ambil daftar buku yang sedang dipinjam
        $borrowedBooks = Borrowing::with([
            'bookItem.physicalBook'
        ])
            ->where('user_id', $user->id)
            ->where('status', 'borrowed')
            ->get()
            ->map(function ($borrowing) {
                return [
                    'id' => $borrowing->id,
                    'borrowed_at' => $borrowing->borrowed_at,
                    'due_date' => $borrowing->due_date,
                    'status' => $borrowing->status,

                    'book_item' => [
                        'id' => $borrowing->bookItem?->id,
                        'barcode' => $borrowing->bookItem?->barcode,
                        'condition' => $borrowing->bookItem?->condition,
                    ],

                    'book' => [
                        'id' => $borrowing->bookItem?->physicalBook?->id,
                        'title' => $borrowing->bookItem?->physicalBook?->title,
                        'author' => $borrowing->bookItem?->physicalBook?->author,
                        'publisher' => $borrowing->bookItem?->physicalBook?->publisher,
                    ],
                ];
            });

        // Aturan peminjaman
        $maxBorrowLimit = 3;
        $canBorrowMore = $currentBorrowings < $maxBorrowLimit;
        $remainingQuota = $maxBorrowLimit - $currentBorrowings;

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'role_name' => $user->role_name,
                'barcode' => $user->barcode,

                'student' => $user->student,
                'teacher' => $user->teacher,

                'has_late_borrowings' => $hasLateBorrowings,
                'current_borrowings_count' => $currentBorrowings,
                'max_borrow_limit' => $maxBorrowLimit,
                'can_borrow_more' => $canBorrowMore,
                'remaining_quota' => $remainingQuota,

                // Tambahan: daftar buku yang sedang dipinjam
                'borrowed_books' => $borrowedBooks,
            ]
        ]);
    }

    public function searchUsers(Request $request)
    {
        $query = trim($request->search);

        if (strlen($query) < 2) {
            return response()->json([
                'users' => []
            ]);
        }

        $maxBorrowLimit = 3;

        $users = User::query()
            ->with([
                'student.enrollments.classRoom',
                'teacher',
                'borrowings' => function ($query) {
                    $query->where('status', 'borrowed')
                        ->with([
                            'bookItem.physicalBook'
                        ]);
                }
            ])
            ->withCount([
                'borrowings as current_borrowings_count' => function ($query) {
                    $query->where('status', 'borrowed');
                }
            ])
            ->withExists([
                'borrowings as has_late_borrowings' => function ($query) {
                    $query->where('status', 'borrowed')
                        ->where('due_date', '<', now());
                }
            ])
            ->whereIn('role', ['student', 'teacher', 'external'])
            ->where(function ($q) use ($query) {

                // Search user
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%")

                    // Search siswa
                    ->orWhereHas('student', function ($student) use ($query) {
                        $student->where('nis', 'like', "%{$query}%");
                    })

                    // Search guru
                    ->orWhereHas('teacher', function ($teacher) use ($query) {
                        $teacher->where('nip', 'like', "%{$query}%");
                    });
            })
            ->limit(20)
            ->get()
            ->map(function ($user) use ($maxBorrowLimit) {

                // 👇 CASTING MANUAL untuk withCount & withExists
                $user->current_borrowings_count = (int) $user->current_borrowings_count;
                $user->has_late_borrowings = (bool) $user->has_late_borrowings;

                $currentClass = null;

                if ($user->student) {
                    $currentEnrollment = $user->student->enrollments->first();
                    $currentClass = $currentEnrollment?->classRoom?->name;
                }

                return [
                    'id' => (int) $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'role_name' => $user->role_name,

                    'nis' => $user->student?->nis,
                    'nip' => $user->teacher?->nip,

                    'class' => $currentClass,

                    'barcode' => $user->barcode,
                    'total_points' => (int) $user->total_points, // 👈 Tambah cast total_points

                    'has_late_borrowings' => $user->has_late_borrowings, // Sudah bool dari casting di atas
                    'current_borrowings_count' => $user->current_borrowings_count, // Sudah int dari casting di atas

                    'max_borrow_limit' => $maxBorrowLimit,
                    'remaining_quota' => max(
                        0,
                        $maxBorrowLimit - $user->current_borrowings_count
                    ),
                    'can_borrow_more' => $user->current_borrowings_count < $maxBorrowLimit,

                    // Buku yang sedang dipinjam
                    'borrowed_books' => $user->borrowings->map(function ($borrowing) {
                        return [
                            'id' => (int) $borrowing->id,
                            'borrowed_at' => $borrowing->borrowed_at,
                            'due_date' => $borrowing->due_date,
                            'status' => $borrowing->status,

                            'book_item' => [
                                'id' => (int) $borrowing->bookItem?->id,
                                'barcode' => $borrowing->bookItem?->barcode,
                                'condition' => $borrowing->bookItem?->condition,
                            ],

                            'book' => [
                                'id' => (int) $borrowing->bookItem?->physicalBook?->id,
                                'title' => $borrowing->bookItem?->physicalBook?->title,
                                'author' => $borrowing->bookItem?->physicalBook?->author,
                                'publisher' => $borrowing->bookItem?->physicalBook?->publisher,
                            ],
                        ];
                    })->values(),
                ];
            });

        return response()->json([
            'success' => true,
            'users' => $users
        ]);
    }
    /**
     * Cari book item berdasarkan barcode
     */
    public function findBookItem(Request $request)
    {
        $request->validate([
            'barcode' => 'required|string',
        ]);

        $bookItem = BookItem::with('physicalBook')
            ->where('barcode', $request->barcode)
            ->where('status', 'available')
            ->first();

        if (!$bookItem) {
            return back()->withErrors([
                'message' => 'Buku tidak ditemukan atau sedang dipinjam'
            ]);
        }

        return back()->with([
            'book_item' => [
                'id' => $bookItem->id,
                'barcode' => $bookItem->barcode,
                'status' => $bookItem->status,
                'physical_book' => [
                    'id' => $bookItem->physicalBook->id,
                    'title' => $bookItem->physicalBook->title,
                    'author' => $bookItem->physicalBook->author,
                    'publisher' => $bookItem->physicalBook->publisher,
                    'cover_image' => $bookItem->physicalBook->cover_image,
                ]
            ]
        ]);
    }

    /**
     * Pencarian buku fisik manual
     */
    public function searchPhysicalBooks(Request $request)
    {
        $request->validate([
            'search' => 'nullable|string',
            'per_page' => 'nullable|integer',
        ]);

        $query = \App\Models\PhysicalBook::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('author', 'like', "%{$request->search}%")
                    ->orWhere('publisher', 'like', "%{$request->search}%")
                    ->orWhere('isbn', 'like', "%{$request->search}%");
            });
        }

        $physicalBooks = $query->with(['bookItems' => function ($q) {
            $q->where('status', 'available');
        }])
            ->whereHas('bookItems', function ($q) {
                $q->where('status', 'available');
            })
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'physical_books' => $physicalBooks
        ]);
    }

    /**
     * Get available book items from a physical book
     */
    public function getBookItems($physicalBookId)
    {
        $bookItems = BookItem::with('physicalBook')
            ->where('physical_book_id', $physicalBookId)
            ->where('status', 'available')
            ->get();

        return response()->json([
            'success' => true,
            'book_items' => $bookItems
        ]);
    }

    /**
     * Proses peminjaman
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'book_item_ids' => 'required|array|min:1',
            'book_item_ids.*' => 'exists:book_items,id',
            'due_date' => 'required|date|after:today',
        ]);

        // Cek user
        $user = User::find($request->user_id);

        // Cek apakah user memiliki pinjaman terlambat
        $hasLateBorrowings = Borrowing::where('user_id', $user->id)
            ->where('status', 'borrowed')
            ->where('due_date', '<', now())
            ->exists();

        if ($hasLateBorrowings) {
            return response()->json([
                'success' => false,
                'message' => 'User memiliki pinjaman terlambat, harap selesaikan terlebih dahulu'
            ], 422);
        }

        // Cek batas peminjaman
        $currentBorrowings = Borrowing::where('user_id', $user->id)
            ->where('status', 'borrowed')
            ->count();

        $maxBorrowLimit = 3;
        if ($currentBorrowings + count($request->book_item_ids) > $maxBorrowLimit) {
            return response()->json([
                'success' => false,
                'message' => "Melebihi batas peminjaman (maksimal {$maxBorrowLimit} buku)"
            ], 422);
        }

        // Cek ketersediaan buku
        $bookItems = BookItem::whereIn('id', $request->book_item_ids)
            ->where('status', 'available')
            ->get();

        if ($bookItems->count() !== count($request->book_item_ids)) {
            return response()->json([
                'success' => false,
                'message' => 'Beberapa buku sudah tidak tersedia'
            ], 422);
        }

        // Get active point period
        $activePointPeriod = PointPeriods::where('is_active', true)
            ->where('started_at', '<=', now())
            ->where(function ($q) {
                $q->whereNull('ended_at')
                    ->orWhere('ended_at', '>=', now());
            })
            ->first();

        DB::beginTransaction();
        try {
            $borrowings = [];
            $borrowedBooks = [];

            foreach ($bookItems as $bookItem) {
                // Update status book item
                $bookItem->update(['status' => 'borrowed']);

                // Create borrowing record
                $borrowing = Borrowing::create([
                    'user_id' => $user->id,
                    'book_item_id' => $bookItem->id,
                    'borrowed_at' => now(),
                    'due_date' => Carbon::parse($request->due_date),
                    'status' => 'borrowed',
                    'fine_amount' => 0,
                    'fine_paid' => false,
                ]);

                $borrowings[] = $borrowing;
                $borrowedBooks[] = $bookItem->physicalBook->title;

                // Add points for borrowing
                if ($activePointPeriod) {
                    PointHistory::create([
                        'user_id' => $user->id,
                        'point_period_id' => $activePointPeriod->id,
                        'type' => 'borrow_book',
                        'points' => 10, // 10 points per book borrowed
                        'description' => "Meminjam buku: {$bookItem->physicalBook->title}"
                    ]);

                    // Update user total points
                    $user->increment('total_points', 10);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Berhasil meminjam " . count($borrowings) . " buku",
                'borrowings' => $borrowings,
                'borrowed_books' => $borrowedBooks,
                'due_date' => Carbon::parse($request->due_date)->format('d/m/Y'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get recent borrowings for display
     */
    public function recent(Request $request)
    {
        $borrowings = Borrowing::with(['user', 'bookItem.physicalBook'])
            ->orderBy('created_at', 'desc')
            ->limit($request->limit ?? 10)
            ->get();

        return response()->json([
            'success' => true,
            'borrowings' => $borrowings
        ]);
    }
}
