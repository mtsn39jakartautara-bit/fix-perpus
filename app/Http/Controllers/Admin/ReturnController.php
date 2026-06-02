<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Borrowing;
use App\Models\PointHistory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReturnController extends Controller
{
    /**
     * Tampilkan halaman pengembalian
     */
    public function index()
    {
        return inertia('Admin/Returns/Index');
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

        // Ambil daftar buku yang sedang dipinjam
        $borrowedBooks = Borrowing::with([
            'bookItem.physicalBook'
        ])
            ->where('user_id', $user->id)
            ->where('status', 'borrowed')
            ->get()
            ->map(function ($borrowing) {
                // Hitung denda jika terlambat
                $fine = 0;
                $dueDate = Carbon::parse($borrowing->due_date);
                $today = Carbon::now();

                if ($today->gt($dueDate)) {
                    $daysLate = $dueDate->diffInDays($today);
                    $fine = $daysLate * 1000; // Rp 1000 per hari
                }

                return [
                    'id' => $borrowing->id,
                    'borrowed_at' => $borrowing->borrowed_at,
                    'due_date' => $borrowing->due_date,
                    'status' => $borrowing->status,
                    'fine' => $fine,
                    'is_late' => $today->gt($dueDate),
                    'days_late' => $today->gt($dueDate) ? $dueDate->diffInDays($today) : 0,

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
                        'cover_image' => $borrowing->bookItem?->physicalBook?->cover_image,
                    ],
                ];
            });

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
                'borrowed_books' => $borrowedBooks,
                'total_borrowed' => $borrowedBooks->count(),
            ]
        ]);
    }

    /**
     * Search users untuk manual input
     */
    public function searchUsers(Request $request)
    {
        $query = trim($request->search);

        if (strlen($query) < 2) {
            return response()->json([
                'users' => []
            ]);
        }

        $users = User::query()
            ->with([
                'student.enrollments.classRoom',
                'teacher',
                'borrowings' => function ($query) {
                    $query->where('status', 'borrowed')
                        ->with(['bookItem.physicalBook']);
                }
            ])
            ->whereIn('role', ['student', 'teacher', 'external'])
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%")
                    ->orWhere('barcode', 'like', "%{$query}%")
                    ->orWhereHas('student', function ($student) use ($query) {
                        $student->where('nis', 'like', "%{$query}%");
                    })
                    ->orWhereHas('teacher', function ($teacher) use ($query) {
                        $teacher->where('nip', 'like', "%{$query}%");
                    });
            })
            ->limit(20)
            ->get()
            ->map(function ($user) {
                $currentClass = null;
                if ($user->student) {
                    $currentEnrollment = $user->student->enrollments->first();
                    $currentClass = $currentEnrollment?->classRoom?->name;
                }

                $borrowedBooks = $user->borrowings->map(function ($borrowing) {
                    $fine = 0;
                    $dueDate = Carbon::parse($borrowing->due_date);
                    $today = Carbon::now();

                    if ($today->gt($dueDate)) {
                        $daysLate = $dueDate->diffInDays($today);
                        $fine = $daysLate * 1000;
                    }

                    return [
                        'id' => $borrowing->id,
                        'borrowed_at' => $borrowing->borrowed_at,
                        'due_date' => $borrowing->due_date,
                        'status' => $borrowing->status,
                        'fine' => $fine,
                        'is_late' => $today->gt($dueDate),
                        'days_late' => $today->gt($dueDate) ? $dueDate->diffInDays($today) : 0,
                        'book_item' => [
                            'id' => $borrowing->bookItem?->id,
                            'barcode' => $borrowing->bookItem?->barcode,
                        ],
                        'book' => [
                            'id' => $borrowing->bookItem?->physicalBook?->id,
                            'title' => $borrowing->bookItem?->physicalBook?->title,
                            'author' => $borrowing->bookItem?->physicalBook?->author,
                            'publisher' => $borrowing->bookItem?->physicalBook?->publisher,
                        ],
                    ];
                });

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'role_name' => $user->role_name,
                    'nis' => $user->student?->nis,
                    'nip' => $user->teacher?->nip,
                    'class' => $currentClass,
                    'barcode' => $user->barcode,
                    'total_points' => $user->total_points,
                    'borrowed_books' => $borrowedBooks,
                    'total_borrowed' => $borrowedBooks->count(),
                ];
            });

        return response()->json([
            'success' => true,
            'users' => $users
        ]);
    }

    /**
     * Proses pengembalian buku
     */
    public function processReturn(Request $request)
    {
        $request->validate([
            'borrowing_ids' => 'required|array|min:1',
            'borrowing_ids.*' => 'exists:borrowings,id',
        ]);

        DB::beginTransaction();

        try {
            $returns = [];
            $totalFine = 0;
            $returnedBooks = [];
            $totalPoints = 0;

            // Get active point period
            $activePointPeriod = \App\Models\PointPeriods::where('is_active', true)
                ->where('started_at', '<=', now())
                ->where(function ($q) {
                    $q->whereNull('ended_at')
                        ->orWhere('ended_at', '>=', now());
                })
                ->first();

            foreach ($request->borrowing_ids as $borrowingId) {
                $borrowing = Borrowing::with(['bookItem.physicalBook', 'user'])
                    ->where('id', $borrowingId)
                    ->where('status', 'borrowed')
                    ->first();

                if (!$borrowing) {
                    throw new \Exception("Peminjaman dengan ID {$borrowingId} tidak ditemukan atau sudah dikembalikan");
                }

                // Hitung denda jika terlambat
                $dueDate = Carbon::parse($borrowing->due_date);
                $returnDate = Carbon::now();
                $fine = 0;

                if ($returnDate->gt($dueDate)) {
                    $daysLate = $dueDate->diffInDays($returnDate);
                    $fine = $daysLate * 1000; // Rp 1000 per hari
                    $totalFine += $fine;
                }

                // Update status borrowing
                $borrowing->update([
                    'status' => 'returned',
                    'returned_at' => $returnDate,
                    'fine_amount' => $fine,
                ]);

                // Update status book item menjadi available
                $borrowing->bookItem->update(['status' => 'available']);

                // Tambah poin untuk pengembalian buku (15 poin per buku)
                if ($activePointPeriod) {
                    $pointsEarned = 15; // 15 poin per buku yang dikembalikan
                    $totalPoints += $pointsEarned;

                    // Create point history
                    PointHistory::create([
                        'user_id' => $borrowing->user->id,
                        'point_period_id' => $activePointPeriod->id,
                        'type' => 'return_book',
                        'points' => $pointsEarned,
                        'description' => "Mengembalikan buku: {$borrowing->bookItem->physicalBook->title}"
                    ]);

                    // Update user total points
                    $borrowing->user->increment('total_points', $pointsEarned);
                }

                $returns[] = $borrowing;
                $returnedBooks[] = $borrowing->bookItem->physicalBook->title;
            }

            DB::commit();

            // Prepare response message with points info
            $message = "Berhasil mengembalikan " . count($returns) . " buku";

            if ($totalPoints > 0) {
                $message .= " dan mendapatkan {$totalPoints} poin";
            }

            if ($totalFine > 0) {
                $message .= " dengan denda Rp " . number_format($totalFine, 0, ',', '.');
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'returns' => $returns,
                'returned_books' => $returnedBooks,
                'total_fine' => $totalFine,
                'total_points' => $totalPoints,
                'return_date' => Carbon::now()->format('d/m/Y H:i:s'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }
}
