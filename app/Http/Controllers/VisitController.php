<?php

namespace App\Http\Controllers;

use App\Models\Visit;
use App\Models\LibraryCheckPoint;
use App\Models\PointHistory;
use App\Models\PointPeriods;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Milon\Barcode\Facades\DNS2DFacade as DNS2D;

class VisitController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Ambil riwayat aktivitas user
        $activities = PointHistory::with(['user', 'pointPeriod'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get()
            ->map(function ($history) {
                return [
                    'id' => $history->id,
                    'type' => $history->type,
                    'time' => $history->created_at->diffForHumans(),
                    'created_at' => $history->created_at,
                    'user_name' => $history->user->name,
                    'point_period_name' => $history->pointPeriod->name
                ];
            });

        // Generate QR Code barcode user
        $barcodeHtml = $user->barcode ? DNS2D::getBarcodeHTML($user->barcode, 'QRCODE', 10, 10) : null;

        return Inertia::render('Visits/Index', [
            'activities' => $activities,
            'userBarcode' => $user->barcode,
            'userBarcodeHtml' => $barcodeHtml,
            'userName' => $user->name,
            'userPoints' => $user->total_points,
        ]);
    }

    public function scanCheckpoint(Request $request)
    {
        $request->validate([
            'barcode' => 'required|string',
        ]);

        $currentPeriod = PointPeriods::where(
            'is_active',
            true
        )->firstOrFail();

        if (!$currentPeriod) {
            return back()->withErrors(['message' => 'Tidak ada periode aktif!']);
        }

        $checkpoint = LibraryCheckPoint::where('barcode', $request->barcode)->first();

        if (!$checkpoint) {

            return response()->json([
                'success' => false,
                'message' => 'Barcode checkpoint tidak valid!'
            ], 404);
        }

        /** @var \App\Models\User $user */
        $user = auth()->user();

        // Cek apakah sudah visit hari ini
        $todayVisit = Visit::where('user_id', $user->id)
            ->whereDate('created_at', Carbon::today())
            ->first();

        if ($todayVisit) {

            return back()->withErrors(['message' => 'Anda sudah melakukan kunjungan hari ini!']);
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah melakukan kunjungan hari ini!'
            ], 400);
        }

        // Gunakan transaction untuk memastikan data konsisten
        DB::beginTransaction();

        try {
            // Buat visit record
            $visit = Visit::create([
                'user_id' => $user->id,
                'type' => 'offline',
            ]);

            // Tambah poin untuk kunjungan offline
            $points = 10; // Misal 10 poin per kunjungan
            $user->increment('total_points', $points);

            // Catat history poin
            PointHistory::create([
                'user_id' => $user->id,
                'point_period_id' => $currentPeriod->id,
                'type' => 'visit_offline',
                'points' => $points,
                'description' => "Kunjungan offline di {$checkpoint->name}",
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Kunjungan berhasil!');
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan, silakan coba lagi.'
            ], 500);
        }
    }

    public function getActivities(Request $request)
    {
        $user = auth()->user();

        $activities = Visit::with('user')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($activities);
    }

    public function getUserBarcode(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        if (!$user->barcode) {
            // Generate barcode jika belum ada
            $user->barcode = 'USER-' . strtoupper(uniqid()) . '-' . $user->id;
            $user->save();
        }

        $barcodeHtml = DNS2D::getBarcodeHTML($user->barcode, 'QRCODE', 10, 10);

        return response()->json([
            'barcode' => $user->barcode,
            'barcode_html' => $barcodeHtml,
            'name' => $user->name,
            'points' => $user->total_points,
        ]);
    }
}
