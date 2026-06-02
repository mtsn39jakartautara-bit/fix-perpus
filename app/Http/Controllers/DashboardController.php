<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Borrowing;
use App\Models\Enrollments;
use App\Models\PointHistory;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use App\Models\Visit;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $role = $user->role;

        // Data user
        $userData = [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $role,
            'points' => $user->total_points,
            'barcode' => $user->barcode,
        ];

        // Tambahkan data spesifik role
        if ($role === 'student') {
            $student = Student::where('user_id', $user->id)->first();
            $currentEnrollment = Enrollments::with(['classRoom', 'academicYear'])
                ->where('student_id', $student->id)
                ->whereHas('academicYear', function ($q) {
                    $q->where('is_active', true);
                })
                ->first();

            $userData['class'] = $currentEnrollment ? $currentEnrollment->classRoom->name : 'Belum ada kelas';
            $userData['nis'] = $student->nis ?? '-';
            $userData['avatar'] = null;
        } elseif ($role === 'teacher') {
            $teacher = Teacher::where('user_id', $user->id)->first();
            $userData['nip'] = $teacher->nip ?? '-';
            $userData['subject'] = $teacher->subject ?? '-';
            $userData['avatar'] = null;
        }

        // Hitung point user
        $userPoints = $user->total_points;

        // Hitung total kunjungan user
        $totalVisits = Visit::where('user_id', $user->id)->count();

        // Hitung total peminjaman user (yang sudah dan sedang)
        $totalBorrowings = Borrowing::where('user_id', $user->id)->count();

        // Chart data: poin per bulan (6 bulan terakhir)
        $chartData = $this->getPointsChartData($user->id);

        // User list dari point terbanyak (top 10 untuk masing-masing role)


        $topStudents = User::where('users.role', 'student')
            ->join('students', 'users.id', '=', 'students.user_id')
            ->where('students.status', 'active')
            ->leftJoin('enrollments', function ($join) {
                $join->on('students.id', '=', 'enrollments.student_id')
                    ->join('academic_years', function ($aq) {
                        $aq->on('enrollments.academic_year_id', '=', 'academic_years.id')
                            ->where('academic_years.is_active', true);
                    });
            })
            ->leftJoin('classes', 'enrollments.class_id', '=', 'classes.id')
            ->select('users.*', 'classes.name as class_name')
            ->orderBy('users.total_points', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'points' => $user->total_points,
                    'class' => $user->class_name ?? '-',
                    'role' => 'student',
                ];
            });


        $topTeachers = User::where('role', 'teacher')
            ->with('teacher')
            ->orderBy('total_points', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'points' => $user->total_points,
                    'subject' => $user->teacher->subject ?? '-',
                    'role' => 'teacher',
                ];
            });

        // Aktivitas terbaru user
        $recentActivities = $this->getRecentActivities($user->id);

        // Pengumuman terbaru
        $announcements = $this->getAnnouncements();

        // Notifikasi
        $notifications = $this->getNotifications($user);

        // Hitung peringkat user berdasarkan poin (dalam role masing-masing)
        $rank = User::where('role', $role)
            ->where('total_points', '>', $user->total_points)
            ->count() + 1;

        $totalUsersInRole = User::where('role', $role)->count();
        $rankProgress = $totalUsersInRole > 0 ? round((1 - ($rank / $totalUsersInRole)) * 100) : 0;

        // Saran untuk next level poin
        $nextMilestone = ceil($userPoints / 1000) * 1000;
        $pointsToNext = $nextMilestone - $userPoints;
        $progressToNext = $userPoints % 1000;
        $progressPercentage = ($progressToNext / 1000) * 100;


        return Inertia::render('Dashboard', [
            'user' => $userData,
            'userPoints' => $userPoints,
            'totalVisits' => $totalVisits,
            'totalBorrowings' => $totalBorrowings,
            'chartData' => $chartData,
            'topStudents' => $topStudents,
            'topTeachers' => $topTeachers,
            'recentActivities' => $recentActivities,
            'announcements' => $announcements,
            'notifications' => $notifications,
            'rank' => $rank,
            'rankProgress' => $rankProgress,
            'nextMilestone' => $nextMilestone,
            'pointsToNext' => $pointsToNext,
            'progressPercentage' => $progressPercentage,
        ]);
    }

    private function getPointsChartData($userId)
    {
        $pointsData = [];

        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $points = PointHistory::where('user_id', $userId)
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->sum('points');

            $pointsData[] = [
                'month' => $month->locale('id')->isoFormat('MMM'),
                'points' => $points,
            ];
        }

        return $pointsData;
    }

    private function getRecentActivities($userId)
    {
        $activities = collect();

        // Kunjungan
        $visits = Visit::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($visit) {
                return [
                    'id' => $visit->id,
                    'type' => 'visit',
                    'title' => 'Kunjungan Perpustakaan',
                    'description' => $visit->type === 'offline' ? 'Kunjungan offline' : 'Kunjungan online',
                    'points' => 10,
                    'created_at' => $visit->created_at,
                    'time_ago' => Carbon::parse($visit->created_at)->diffForHumans(),
                ];
            });

        // Peminjaman dan pengembalian
        $borrowings = Borrowing::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->with('bookItem.physicalBook')
            ->get()
            ->map(function ($borrowing) {
                $isReturn = !is_null($borrowing->returned_at);
                return [
                    'id' => $borrowing->id,
                    'type' => $isReturn ? 'return' : 'borrow',
                    'title' => $isReturn ? 'Pengembalian Buku' : 'Peminjaman Buku',
                    'description' => $borrowing->bookItem->physicalBook->title,
                    'points' => $isReturn ? 5 : 0,
                    'created_at' => $isReturn ? $borrowing->returned_at : $borrowing->borrowed_at,
                    'time_ago' => Carbon::parse($isReturn ? $borrowing->returned_at : $borrowing->borrowed_at)->diffForHumans(),
                ];
            });

        // Poin didapat
        $points = PointHistory::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($point) {
                return [
                    'id' => $point->id,
                    'type' => 'points',
                    'title' => 'Poin Didapatkan',
                    'description' => $point->description ?? $point->type,
                    'points' => $point->points,
                    'created_at' => $point->created_at,
                    'time_ago' => Carbon::parse($point->created_at)->diffForHumans(),
                ];
            });

        $activities = $visits->merge($borrowings)->merge($points);

        return $activities->sortByDesc('created_at')->take(10)->values();
    }

    private function getAnnouncements()
    {
        return Announcement::where('is_active', true)
            ->orderBy('date', 'desc')
            ->take(5)
            ->get()
            ->map(function ($announcement) {
                return [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'date' => Carbon::parse($announcement->date)->locale('id')->isoFormat('dddd, D MMMM Y'),
                    'tag' => $announcement->category,
                    'description' => $announcement->description,
                ];
            });
    }

    private function getNotifications($user)
    {
        $notifications = [];

        // Buku mendekati deadline
        $nearDueBorrowings = Borrowing::where('user_id', $user->id)
            ->whereNull('returned_at')
            ->where('due_date', '<=', Carbon::now()->addDays(3))
            ->where('due_date', '>=', Carbon::now())
            ->with('bookItem.physicalBook')
            ->get();

        foreach ($nearDueBorrowings as $borrowing) {
            $daysLeft = Carbon::now()->diffInDays($borrowing->due_date, false);
            $notifications[] = [
                'id' => uniqid(),
                'title' => 'Buku akan jatuh tempo!',
                'message' => "Buku '{$borrowing->bookItem->physicalBook->title}' akan jatuh tempo dalam {$daysLeft} hari",
                'type' => 'warning',
                'created_at' => $borrowing->due_date,
                'time_ago' => Carbon::parse($borrowing->due_date)->diffForHumans(),
            ];
        }

        // Buku terlambat
        $overdueBorrowings = Borrowing::where('user_id', $user->id)
            ->whereNull('returned_at')
            ->where('due_date', '<', Carbon::now())
            ->with('bookItem.physicalBook')
            ->get();

        foreach ($overdueBorrowings as $borrowing) {
            $daysLate = Carbon::now()->diffInDays($borrowing->due_date);
            $notifications[] = [
                'id' => uniqid(),
                'title' => 'Buku Terlambat!',
                'message' => "Buku '{$borrowing->bookItem->physicalBook->title}' terlambat {$daysLate} hari. Segera kembalikan!",
                'type' => 'danger',
                'created_at' => $borrowing->due_date,
                'time_ago' => Carbon::parse($borrowing->due_date)->diffForHumans(),
            ];
        }

        // Poin terbaru
        $recentPoints = PointHistory::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get();

        foreach ($recentPoints as $point) {
            $notifications[] = [
                'id' => uniqid(),
                'title' => 'Poin Bertambah!',
                'message' => "+{$point->points} poin dari " . ($point->description ?? $point->type),
                'type' => 'success',
                'created_at' => $point->created_at,
                'time_ago' => Carbon::parse($point->created_at)->diffForHumans(),
            ];
        }

        // Sort by created_at desc
        usort($notifications, function ($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        return array_slice($notifications, 0, 5);
    }
}
