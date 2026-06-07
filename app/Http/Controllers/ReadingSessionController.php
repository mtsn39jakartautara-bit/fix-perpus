<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ReadingSession;
use App\Models\ReadingReward;
use App\Models\Book;
use Illuminate\Support\Carbon;

class ReadingSessionController extends Controller
{
    public function getSession($bookId)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $today = Carbon::today();

        // Cari session untuk HARI INI
        $session = ReadingSession::where('user_id', $user->id)
            ->where('book_id', $bookId)
            ->where('session_date', $today)
            ->first();

        // Dapatkan durasi buku (dalam detik)
        $book = Book::find($bookId);
        // Konversi dari menit ke detik (karena reading_duration di books dalam menit)
        $defaultDuration = ($book->reading_duration ?? 10) * 60; // 10 menit * 60 = 600 detik

        if (!$session) {
            // Belum ada session hari ini, buat session baru dengan durasi penuh
            $session = ReadingSession::create([
                'user_id' => $user->id,
                'book_id' => $bookId,
                'session_date' => $today,
                'remaining_seconds' => $defaultDuration,
                'is_active' => false,
                'last_activity_at' => null
            ]);

            return response()->json([
                'remaining_seconds' => $defaultDuration,
                'is_active' => false,
                'can_claim_reward' => false,
                'has_claimed_today' => false,
                'session_id' => $session->id
            ]);
        }

        // Cek apakah sudah claim reward hari ini
        $hasClaimedToday = ReadingReward::where('user_id', $user->id)
            ->where('book_id', $bookId)
            ->where('reward_date', $today)
            ->exists();

        // Cek apakah session sudah selesai (remaining_seconds = 0) dan belum claim reward
        $canClaimReward = $session->remaining_seconds <= 0 && !$hasClaimedToday;

        return response()->json([
            'remaining_seconds' => $session->remaining_seconds,
            'is_active' => $session->is_active,
            'can_claim_reward' => $canClaimReward,
            'has_claimed_today' => $hasClaimedToday,
            'session_id' => $session->id
        ]);
    }

    // Update session (setiap detik dari frontend)
    public function updateSession(Request $request, $bookId)
    {
        $request->validate([
            'remaining_seconds' => 'required|integer|min:0'
        ]);

        /** @var \App\Models\User $user */
        $user = auth()->user();
        $today = Carbon::today();

        // Update atau create session untuk HARI INI
        $session = ReadingSession::updateOrCreate(
            [
                'user_id' => $user->id,
                'book_id' => $bookId,
                'session_date' => $today
            ],
            [
                'remaining_seconds' => $request->remaining_seconds,
                'last_activity_at' => Carbon::now(),
                'is_active' => $request->remaining_seconds > 0
            ]
        );

        return response()->json(['success' => true]);
    }

    // Claim reward setelah countdown selesai
    public function claimReward($bookId)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $today = Carbon::today();
        $points = 10; // Jumlah point yang didapat

        // Cek apakah sudah claim reward hari ini
        $existingReward = ReadingReward::where('user_id', $user->id)
            ->where('book_id', $bookId)
            ->where('reward_date', $today)
            ->first();

        if ($existingReward) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah mendapatkan point untuk buku ini hari ini'
            ], 400);
        }

        // Cek session hari ini
        $session = ReadingSession::where('user_id', $user->id)
            ->where('book_id', $bookId)
            ->where('session_date', $today)
            ->first();

        // Pastikan session ada
        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Session tidak ditemukan'
            ], 400);
        }

        // PERBAIKAN: Allow claim jika remaining_seconds <= 1 (bukan hanya 0)
        // Ini mengatasi race condition dimana server belum update ke 0
        if ($session->remaining_seconds > 1) {
            return response()->json([
                'success' => false,
                'message' => 'Waktu membaca belum selesai. Sisa waktu: ' . $session->remaining_seconds . ' detik'
            ], 400);
        }

        // Set session menjadi 0 jika masih 1
        if ($session->remaining_seconds == 1) {
            $session->update(['remaining_seconds' => 0]);
        }

        // Create reward
        $reward = ReadingReward::create([
            'user_id' => $user->id,
            'book_id' => $bookId,
            'points_earned' => $points,
            'reward_date' => $today
        ]);

        // Update user total_points
        $user->increment('total_points', $points);

        // Refresh user data to get updated total_points
        $user->refresh();

        return response()->json([
            'success' => true,
            'points' => $points,
            'total_points' => $user->total_points
        ]);
    }
}
