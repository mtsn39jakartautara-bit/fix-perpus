<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PointHistory;
use App\Models\PointPeriods;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class VisitController extends Controller
{
    /**
     * Display visits management page
     */
    public function index()
    {
        $todayVisits = Visit::with('user')
            ->whereDate('created_at', Carbon::today())
            ->orderBy('created_at', 'desc')
            ->get();

        $recentVisits = Visit::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $todayCount = Visit::whereDate('created_at', Carbon::today())->count();

        $totalPointsToday = PointHistory::whereDate('created_at', Carbon::today())
            ->where('type', 'visit_offline')
            ->sum('points');

        return inertia('Admin/Visits/Index', [
            'todayVisits' => $todayVisits,
            'recentVisits' => $recentVisits,
            'todayCount' => $todayCount,
            'totalPointsToday' => $totalPointsToday,
            'batchResult' => session('batchResult'),
        ]);
    }

    /**
     * Search users by name, NIS, NIP, or email
     */
    public function search(Request $request)
    {
        $query = trim($request->get('q', ''));

        if (strlen($query) < 2) {
            return response()->json([
                'users' => []
            ]);
        }

        $users = User::query()
            ->with([
                'student.enrollments.classRoom',
                'teacher'
            ])
            ->whereIn('role', ['student', 'teacher', 'external'])
            ->where(function ($q) use ($query) {

                // search user
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%")

                    // search siswa
                    ->orWhereHas('student', function ($student) use ($query) {
                        $student->where('nis', 'like', "%{$query}%");
                    })

                    // search guru
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

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,

                    'nis' => $user->student?->nis,
                    'nip' => $user->teacher?->nip,

                    'class' => $currentClass,

                    'barcode' => $user->barcode,
                    'total_points' => $user->total_points,
                ];
            });


        return response()->json([
            'users' => $users
        ]);
    }
    /**
     * Record visit via barcode scan
     */
    public function scan(Request $request)
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


        // Find user by barcode (NIS, NISN, NIP, or custom barcode)
        $user = User::where(function ($query) use ($request) {
            $query->where('barcode', $request->barcode);
        })->first();



        if (!$user) {
            return back()->withErrors(['message' => 'Barcode tidak valid! Pengguna tidak ditemukan.']);
        }

        // Check if user already visited today
        $todayVisit = Visit::where('user_id', $user->id)
            ->whereDate('created_at', Carbon::today())
            ->first();


        if ($todayVisit) {
            return back()->withErrors(['message' => ucfirst($user->role) . ' ' . $user->name . ' sudah melakukan kunjungan hari ini!']);
        }

        DB::beginTransaction();

        try {
            // Create visit record
            $visit = Visit::create([
                'user_id' => $user->id,
                'type' => 'offline',
                'created_by' => auth()->id(),
            ]);


            // Add points for offline visit
            $points = 10;
            $user->increment('total_points', $points);

            // Record point history
            PointHistory::create([
                'user_id' => $user->id,
                'point_period_id' => $currentPeriod->id,
                'type' => 'visit_offline',
                'points' => $points,
                'description' => "Kunjungan offline via admin scan",
            ]);

            DB::commit();

            return back()->with('success', 'Kunjungan berhasil dicatat untuk ' . $user->name);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['message' => 'Terjadi kesalahan, silakan coba lagi.']);
        }
    }

    /**
     * Record visit manually
     */
    public function manual(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        $currentPeriod = PointPeriods::where(
            'is_active',
            true
        )->firstOrFail();

        if (!$currentPeriod) {
            return back()->withErrors(['message' => 'Tidak ada periode aktif!']);
        }

        $user = User::findOrFail($validated['user_id']);

        $alreadyVisited = Visit::where('user_id', $user->id)
            ->whereDate('created_at', Carbon::today())
            ->exists();

        if ($alreadyVisited) {
            return back()->withErrors([
                'message' => ucfirst($user->role) . ' ' . $user->name . ' sudah melakukan kunjungan hari ini.'
            ]);
        }

        try {
            DB::transaction(function () use ($user) {

                Visit::create([
                    'user_id' => $user->id,
                    'type'    => 'offline',
                ]);

                $points = 10;

                $user->increment('total_points', $points);

                $currentPeriod = PointPeriods::where(
                    'is_active',
                    true
                )->first();

                PointHistory::create([
                    'user_id'     => $user->id,
                    'point_period_id' => $currentPeriod->id,
                    'type'        => 'visit_offline',
                    'points'      => $points,
                    'description' => 'Kunjungan offline melalui input manual admin',
                ]);
            });

            return back()->with(
                'success',
                "Kunjungan berhasil dicatat untuk {$user->name}"
            );
        } catch (\Throwable $e) {

            report($e);

            return back()->withErrors([
                'message' => 'Terjadi kesalahan saat mencatat kunjungan.'
            ]);
        }
    }

    // app/Http/Controllers/Admin/VisitController.php

    public function batch(Request $request)
    {
        $validated = $request->validate([
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['exists:users,id'],
        ]);

        $currentPeriod = PointPeriods::where('is_active', true)->firstOrFail();

        if (!$currentPeriod) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada periode aktif!'
            ], 400);
        }

        $results = [
            'success' => [],
            'failed' => [],
        ];

        foreach ($validated['user_ids'] as $userId) {
            $user = User::find($userId);

            // Check if already visited today
            $alreadyVisited = Visit::where('user_id', $user->id)
                ->whereDate('created_at', Carbon::today())
                ->exists();

            if ($alreadyVisited) {
                $results['failed'][] = [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'role' => $user->role,
                    ],
                    'reason' => ucfirst($user->role) . ' ' . $user->name . ' sudah melakukan kunjungan hari ini.'
                ];
                continue;
            }

            try {
                DB::transaction(function () use ($user, $currentPeriod) {
                    Visit::create([
                        'user_id' => $user->id,
                        'type' => 'offline',
                    ]);

                    $points = 10;
                    $user->increment('total_points', $points);

                    PointHistory::create([
                        'user_id' => $user->id,
                        'point_period_id' => $currentPeriod->id,
                        'type' => 'visit_offline',
                        'points' => $points,
                        'description' => 'Kunjungan offline melalui input manual admin (batch)',
                    ]);
                });

                $results['success'][] = [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->role,
                ];
            } catch (\Throwable $e) {
                report($e);
                $results['failed'][] = [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'role' => $user->role,
                    ],
                    'reason' => 'Terjadi kesalahan sistem.'
                ];
            }
        }

        // Refresh data untuk dikirim ke frontend
        $todayVisits = Visit::with('user')
            ->whereDate('created_at', Carbon::today())
            ->orderBy('created_at', 'desc')
            ->get();

        $recentVisits = Visit::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $todayCount = Visit::whereDate('created_at', Carbon::today())->count();

        $totalPointsToday = PointHistory::whereDate('created_at', Carbon::today())
            ->where('type', 'visit_offline')
            ->sum('points');

        return redirect()->back()->with([
            'batchResult' => $results,
            'todayVisits' => $todayVisits,
            'recentVisits' => $recentVisits,
            'todayCount' => $todayCount,
            'totalPointsToday' => $totalPointsToday,
        ]);
    }
}
