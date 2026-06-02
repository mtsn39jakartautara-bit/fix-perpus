<?php

namespace App\Http\Controllers;

use App\Models\Borrowing;

use App\Models\PointHistory;
use App\Models\PointPeriods;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BorrowingController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        // Ambil semua peminjaman user dengan relasi
        $borrowings = Borrowing::with(['bookItem.physicalBook'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($borrowing) {
                return [
                    'id' => $borrowing->id,
                    'book_title' => $borrowing->bookItem->physicalBook->title,
                    'book_author' => $borrowing->bookItem->physicalBook->author,
                    'book_cover' => $borrowing->bookItem->physicalBook->cover_image ?? null,
                    'barcode' => $borrowing->bookItem->barcode,
                    'borrowed_at' => $borrowing->borrowed_at,
                    'due_date' => $borrowing->due_date,
                    'returned_at' => $borrowing->returned_at,
                    'status' => $borrowing->status,
                    'fine_amount' => $borrowing->fine_amount,
                    'fine_paid' => $borrowing->fine_paid,
                    'is_overdue' => Carbon::now()->gt($borrowing->due_date) && !$borrowing->returned_at,
                    'days_left' => $borrowing->returned_at ? null : Carbon::now()->diffInDays($borrowing->due_date, false),
                ];
            });

        // Statistik peminjaman
        $stats = [
            'total_borrowed' => $borrowings->where('status', 'borrowed')->count(),
            'total_returned' => $borrowings->where('status', 'returned')->count(),
            'total_late' => $borrowings->where('status', 'late')->count(),
            'total_fine' => $borrowings->sum('fine_amount'),
        ];



        return Inertia::render('Borrowings/Index', [
            'borrowings' => $borrowings,
            'stats' => $stats,
        ]);
    }

    public function returnBook(Request $request, $id)
    {
        $request->validate([
            'condition' => 'nullable|in:good,damaged,lost',
        ]);

        $currentPeriod = PointPeriods::where(
            'is_active',
            true
        )->firstOrFail();

        if (!$currentPeriod) {
            return back()->withErrors(['message' => 'Tidak ada periode aktif!']);
        }


        $borrowing = Borrowing::with('bookItem')
            ->where('user_id', auth()->id())
            ->findOrFail($id);

        if ($borrowing->returned_at) {
            return response()->json([
                'success' => false,
                'message' => 'Buku sudah dikembalikan sebelumnya.'
            ], 400);
        }

        DB::beginTransaction();

        try {
            $now = Carbon::now();
            $returned_at = $now;
            $status = 'returned';
            $fine_amount = 0;

            // Hitung denda jika terlambat
            if ($now->gt($borrowing->due_date)) {
                $days_late = $now->diffInDays($borrowing->due_date);
                $fine_amount = $days_late * 1000; // Rp 1000 per hari
                $status = 'late';
            }

            // Update borrowing record
            $borrowing->update([
                'returned_at' => $returned_at,
                'status' => $status,
                'fine_amount' => $fine_amount,
            ]);

            // Update status book item menjadi available
            $borrowing->bookItem->update([
                'status' => 'available'
            ]);

            // Tambah poin untuk pengembalian buku
            $points = 5;

            /** @var \App\Models\User $user */
            $user = auth()->user();
            $user->increment('total_points', $points);

            // Catat history poin
            PointHistory::create([
                'user_id' => $user->id,
                'point_period_id' => $currentPeriod->id,
                'type' => 'return_book',
                'points' => $points,
                'description' => "Pengembalian buku: {$borrowing->bookItem->physicalBook->title}",
            ]);

            DB::commit();

            return redirect(route('borrowing.index'))->with('success', 'Buku berhasil dikembalikan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan, silakan coba lagi.'
            ], 500);
        }
    }

    public function extendBook(Request $request, $id)
    {
        $borrowing = Borrowing::where('user_id', auth()->id())
            ->whereNull('returned_at')
            ->findOrFail($id);

        // Cek apakah sudah pernah diperpanjang
        if ($borrowing->extended_at) {
            return response()->json([
                'success' => false,
                'message' => 'Buku hanya bisa diperpanjang 1 kali.'
            ], 400);
        }

        // Cek apakah sudah melewati batas
        if (Carbon::now()->gt($borrowing->due_date)) {
            return response()->json([
                'success' => false,
                'message' => 'Buku sudah melewati batas waktu, tidak bisa diperpanjang.'
            ], 400);
        }

        // Perpanjang 7 hari
        $new_due_date = Carbon::parse($borrowing->due_date)->addDays(7);

        $borrowing->update([
            'due_date' => $new_due_date,
            'extended_at' => Carbon::now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Perpanjangan berhasil! Batas pengembalian baru: ' . $new_due_date->format('d M Y'),
            'new_due_date' => $new_due_date,
        ]);
    }
}
