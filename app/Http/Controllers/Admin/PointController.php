<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PointPeriodResults;
use App\Models\PointPeriods;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PointController extends Controller
{
    public function index()
    {
        $currentPeriod = PointPeriods::where('is_active', true)->first();

        // Get overall rankings (top 10)
        $overallRankings = User::query()
            ->where('total_points', '>', 0)
            ->whereIn('role', ['student', 'teacher', 'external'])
            ->orderByDesc('total_points')
            ->limit(10)
            ->get()
            ->map(function ($user, $index) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->role,
                    'total_points' => $user->total_points,
                    'rank' => $index + 1,
                    'class' => $user->class?->name,
                    'nis' => $user->nis,
                    'nip' => $user->nip,
                ];
            });

        // Get rankings per role
        $roles = ['student', 'teacher', 'external'];
        $roleRankings = [];

        foreach ($roles as $role) {
            $users = User::query()
                ->where('role', $role)
                ->where('total_points', '>', 0)
                ->orderByDesc('total_points')
                ->limit(10)
                ->get()
                ->map(function ($user, $index) use ($role) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'role' => $user->role,
                        'total_points' => $user->total_points,
                        'rank' => $index + 1,
                        'class' => $user->class?->name,
                        'nis' => $user->nis,
                        'nip' => $user->nip,
                    ];
                });

            $roleRankings[] = [
                'role' => $role,
                'roleLabel' => $this->getRoleLabel($role),
                'users' => $users,
                'icon' => $this->getRoleIcon($role),
                'color' => $this->getRoleColor($role),
            ];
        }

        // Get period archives with results
        $periodArchives = PointPeriods::where('is_active', false)
            ->whereNotNull('ended_at')
            ->orderByDesc('ended_at')
            ->limit(6)
            ->get()
            ->map(function ($period) {
                $results = PointPeriodResults::where('point_period_id', $period->id)
                    ->with('user')
                    ->get()
                    ->map(function ($result) {
                        return [
                            'user_id' => $result->user_id,
                            'user_name' => $result->user->name,
                            'user_role' => $result->user->role,
                            'final_points' => $result->final_points,
                            'rank' => $result->rank,
                        ];
                    });

                return [
                    'id' => $period->id,
                    'name' => $period->name,
                    'started_at' => $period->started_at,
                    'ended_at' => $period->ended_at,
                    'results' => $results,
                ];
            });

        // Get statistics
        $totalUsers = User::whereIn('role', ['student', 'teacher', 'external'])->count();
        $totalPoints = User::sum('total_points');
        $averagePoints = $totalUsers > 0 ? round($totalPoints / $totalUsers, 1) : 0;

        return Inertia::render('Admin/Points/Index', [
            'currentPeriod' => $currentPeriod,
            'overallRankings' => $overallRankings,
            'roleRankings' => $roleRankings,
            'periodArchives' => $periodArchives,
            'totalUsers' => $totalUsers,
            'totalPoints' => $totalPoints,
            'averagePoints' => $averagePoints,
        ]);
    }

    public function reset(Request $request)
    {
        DB::beginTransaction();

        try {
            $currentPeriod = PointPeriods::where('is_active', true)->firstOrFail();

            // Get all users with points > 0 grouped by role
            $users = User::query()
                ->where('total_points', '>', 0)
                ->whereIn('role', ['student', 'teacher', 'external'])
                ->orderByDesc('total_points')
                ->get();

            // Save all users to period results
            $rows = [];
            foreach ($users as $index => $user) {
                $rows[] = [
                    'point_period_id' => $currentPeriod->id,
                    'user_id' => $user->id,
                    'final_points' => $user->total_points,
                    'rank' => $index + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if (!empty($rows)) {
                PointPeriodResults::insert($rows);
            }

            // End current period
            $currentPeriod->update([
                'is_active' => false,
                'ended_at' => now(),
            ]);

            // Calculate next season number
            $lastPeriod = PointPeriods::orderByDesc('id')->first();
            $nextSeasonNumber = 1;

            if ($lastPeriod && preg_match('/Periode (\d+)/', $lastPeriod->name, $matches)) {
                $nextSeasonNumber = intval($matches[1]) + 1;
            }

            // Create new period
            PointPeriods::create([
                'name' => "Periode {$nextSeasonNumber}",
                'is_active' => true,
                'started_at' => now(),
                'created_by' => auth()->id(),
            ]);

            // Reset all users points to 0
            User::query()->update(['total_points' => 0]);

            DB::commit();

            return back()->with('success', 'Reset berhasil!');
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }



    public function show($id)
    {
        $period = PointPeriods::with('creator')->findOrFail($id);

        // Get all results for this period
        $results = PointPeriodResults::where('point_period_id', $period->id)
            ->with('user')
            ->orderBy('rank')
            ->get();

        // Prepare overall rankings
        $overallRankings = $results->map(function ($result) {
            return [
                'user_id' => $result->user_id,
                'user_name' => $result->user->name,
                'user_role' => $result->user->role,
                'final_points' => $result->final_points,
                'rank' => $result->rank,
                'class' => $result->user->class?->name,
                'nis' => $result->user->nis,
                'nip' => $result->user->nip,
                'email' => $result->user->email,
            ];
        });

        // Prepare role-based rankings
        $roleRankings = [
            'student' => $overallRankings->filter(fn($r) => $r['user_role'] === 'student')->values(),
            'teacher' => $overallRankings->filter(fn($r) => $r['user_role'] === 'teacher')->values(),
            'external' => $overallRankings->filter(fn($r) => $r['user_role'] === 'external')->values(),
        ];

        // Calculate role statistics
        $roleStats = [];
        $roles = ['student' => 'Siswa', 'teacher' => 'Guru', 'external' => 'Eksternal'];

        foreach ($roles as $role => $label) {
            $roleResults = $overallRankings->filter(fn($r) => $r['user_role'] === $role);
            $count = $roleResults->count();
            $totalPoints = $roleResults->sum('final_points');
            $averagePoints = $count > 0 ? round($totalPoints / $count, 1) : 0;

            $roleStats[] = [
                'role' => $role,
                'roleLabel' => $label,
                'count' => $count,
                'totalPoints' => $totalPoints,
                'averagePoints' => $averagePoints,
                'icon' => $this->getRoleIcon($role),
                'color' => $this->getRoleColor($role),
            ];
        }

        // Calculate total statistics
        $totalParticipants = $overallRankings->count();
        $totalPoints = $overallRankings->sum('final_points');
        $averagePoints = $totalParticipants > 0 ? round($totalPoints / $totalParticipants, 1) : 0;

        $periodData = [
            'id' => $period->id,
            'name' => $period->name,
            'started_at' => $period->started_at,
            'ended_at' => $period->ended_at,
            'created_by' => $period->creator ? [
                'id' => $period->creator->id,
                'name' => $period->creator->name,
            ] : null,
            'results' => $overallRankings,
            'total_participants' => $totalParticipants,
            'total_points' => $totalPoints,
            'average_points' => $averagePoints,
        ];

        return Inertia::render('Admin/Points/Show', [
            'period' => $periodData,
            'roleStats' => $roleStats,
            'overallRankings' => $overallRankings,
            'roleRankings' => $roleRankings,
        ]);
    }

    private function getRoleLabel($role)
    {
        $roleMap = [
            'student' => 'Siswa',
            'teacher' => 'Guru',
            'external' => 'Eksternal',
        ];
        return $roleMap[$role] ?? $role;
    }

    private function getRoleIcon($role)
    {
        $iconMap = [
            'student' => 'GraduationCap',
            'teacher' => 'Briefcase',
            'external' => 'ExternalLink',
        ];
        return $iconMap[$role] ?? 'Users';
    }

    private function getRoleColor($role)
    {
        $colorMap = [
            'student' => 'bg-blue-500/10 text-blue-600 border-blue-200',
            'teacher' => 'bg-green-500/10 text-green-600 border-green-200',
            'external' => 'bg-purple-500/10 text-purple-600 border-purple-200',
        ];
        return $colorMap[$role] ?? 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
}
