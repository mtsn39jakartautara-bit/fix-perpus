<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Borrowing;
use App\Models\PhysicalBook;
use App\Models\PointHistory;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Statistik Pengguna - Cast ke integer
        $totalUsers = (int) User::count();
        $totalStudents = (int) User::where('role', 'student')->count();
        $totalTeachers = (int) User::where('role', 'teacher')->count();
        $totalExternals = (int) User::where('role', 'external')->count();

        // Statistik Buku - Cast ke integer
        $totalPhysicalBooks = (int) PhysicalBook::sum('stock');
        $totalDigitalBooks = (int) Book::count();

        // Statistik Peminjaman - Cast ke integer
        $activeBorrowings = (int) Borrowing::where('status', 'borrowed')->count();
        $returnedBorrowings = (int) Borrowing::where('status', 'returned')->count();
        $lateBorrowings = (int) Borrowing::where('status', 'late')->count();
        $totalBorrowings = (int) Borrowing::count();

        // Statistik Kunjungan - Cast ke integer
        $onlineVisits = (int) Visit::where('type', 'online')->count();
        $offlineVisits = (int) Visit::where('type', 'offline')->count();
        $totalVisits = (int) Visit::count();

        // Statistik Poin - Cast ke integer
        $totalPoints = (int) User::sum('total_points');

        // Trend data (6 bulan terakhir)
        $monthlyTrends = $this->getMonthlyTrends();

        // Kategori terpopuler
        $popularCategories = $this->getPopularCategories();

        // Top 10 users berdasarkan poin - Cast semua numeric values
        $topUsers = User::select('id', 'name', 'role', 'total_points as points')
            ->withCount(['borrowings', 'visits'])
            ->orderBy('total_points', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => (int) $user->id,
                    'name' => (string) $user->name,
                    'role' => (string) $user->role,
                    'points' => (int) ($user->points ?? 0),
                    'borrowings_count' => (int) ($user->borrowings_count ?? 0),
                    'visits_count' => (int) ($user->visits_count ?? 0),
                ];
            });

        // Aktivitas terkini
        $recentActivities = $this->getRecentActivities();

        // Buku paling populer - Cast semua numeric values
        $popularBooks = Borrowing::select('book_item_id', DB::raw('count(*) as borrow_count'))
            ->with('bookItem.physicalBook')
            ->groupBy('book_item_id')
            ->orderBy('borrow_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($borrowing) {
                return [
                    'id' => (int) ($borrowing->bookItem->physicalBook->id ?? 0),
                    'title' => (string) ($borrowing->bookItem->physicalBook->title ?? 'Unknown'),
                    'author' => (string) ($borrowing->bookItem->physicalBook->author ?? 'Unknown'),
                    'borrow_count' => (int) ($borrowing->borrow_count ?? 0),
                ];
            })
            ->filter(function ($book) {
                return $book['id'] > 0; // Filter valid books
            })
            ->values();

        // Hitung trends percentage - Cast ke float/int
        $trends = $this->calculateTrends();

        return Inertia::render('Admin/Dashboard/Index', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalStudents' => $totalStudents,
                'totalTeachers' => $totalTeachers,
                'totalExternals' => $totalExternals,
                'totalBooks' => [
                    'physical' => $totalPhysicalBooks,
                    'digital' => $totalDigitalBooks,
                    'total' => $totalPhysicalBooks + $totalDigitalBooks,
                ],
                'totalBorrowings' => [
                    'active' => $activeBorrowings,
                    'returned' => $returnedBorrowings,
                    'late' => $lateBorrowings,
                    'total' => $totalBorrowings,
                ],
                'totalVisits' => [
                    'online' => $onlineVisits,
                    'offline' => $offlineVisits,
                    'total' => $totalVisits,
                ],
                'totalPoints' => $totalPoints,
            ],
            'monthlyTrends' => $monthlyTrends,
            'popularCategories' => $popularCategories,
            'topUsers' => $topUsers,
            'recentActivities' => $recentActivities,
            'popularBooks' => $popularBooks,
            'trends' => $trends,
        ]);
    }

    private function getMonthlyTrends(): array
    {
        $months = collect(range(5, 0))->map(function ($i) {
            return now()->subMonths($i)->format('Y-m');
        });

        $borrowings = [];
        $visits = [];
        $points = [];

        foreach ($months as $month) {
            $startOfMonth = \Carbon\Carbon::parse($month)->startOfMonth();
            $endOfMonth = \Carbon\Carbon::parse($month)->endOfMonth();

            $borrowings[] = (int) Borrowing::whereBetween('borrowed_at', [$startOfMonth, $endOfMonth])->count();
            $visits[] = (int) Visit::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
            $points[] = (int) PointHistory::whereBetween('created_at', [$startOfMonth, $endOfMonth])->sum('points');
        }

        return [
            'borrowings' => $months->map(function ($month, $index) use ($borrowings) {
                return [
                    'month' => (string) \Carbon\Carbon::parse($month)->translatedFormat('M Y'),
                    'count' => $borrowings[$index],
                ];
            })->values()->toArray(),
            'visits' => $months->map(function ($month, $index) use ($visits) {
                return [
                    'month' => (string) \Carbon\Carbon::parse($month)->translatedFormat('M Y'),
                    'count' => $visits[$index],
                ];
            })->values()->toArray(),
            'points' => $months->map(function ($month, $index) use ($points) {
                return [
                    'month' => (string) \Carbon\Carbon::parse($month)->translatedFormat('M Y'),
                    'points' => $points[$index],
                ];
            })->values()->toArray(),
        ];
    }

    private function getPopularCategories(): array
    {
        $categories = DB::table('categories')
            ->leftJoin('book_category', 'categories.id', '=', 'book_category.category_id')
            ->leftJoin('books', 'book_category.book_id', '=', 'books.id')
            ->leftJoin('wishlists', 'books.id', '=', 'wishlists.book_id')
            ->select('categories.name', DB::raw('count(wishlists.id) as total'))
            ->groupBy('categories.id', 'categories.name')
            ->orderBy('total', 'desc')
            ->limit(6)
            ->get();

        $total = (int) $categories->sum('total');

        return $categories->map(function ($category) use ($total) {
            return [
                'name' => (string) $category->name,
                'count' => (int) ($category->total ?? 0),
                'percentage' => $total > 0 ? (float) round(($category->total / $total) * 100, 1) : 0.0,
            ];
        })->values()->toArray();
    }

    private function getRecentActivities(): array
    {
        $activities = collect();

        // Ambil aktivitas peminjaman terbaru
        $borrowings = Borrowing::with('user')
            ->latest('borrowed_at')
            ->limit(5)
            ->get()
            ->map(function ($borrowing) {
                return [
                    'id' => (string) ('borrow_' . $borrowing->id),
                    'type' => 'borrow',
                    'title' => 'Peminjaman Buku',
                    'description' => 'Meminjam buku',
                    'user_name' => (string) ($borrowing->user->name ?? 'System'),
                    'created_at' => (string) $borrowing->borrowed_at,
                    'time_ago' => (string) $borrowing->borrowed_at->diffForHumans(),
                ];
            });

        // Ambil aktivitas kunjungan terbaru
        $visits = Visit::with('user')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($visit) {
                $typeText = $visit->type === 'online' ? 'Online' : 'Offline';
                return [
                    'id' => (string) ('visit_' . $visit->id),
                    'type' => 'visit',
                    'title' => 'Kunjungan Perpustakaan',
                    'description' => "Kunjungan {$typeText}",
                    'user_name' => (string) ($visit->user->name ?? 'System'),
                    'created_at' => (string) $visit->created_at,
                    'time_ago' => (string) $visit->created_at->diffForHumans(),
                ];
            });

        // Ambil aktivitas perolehan poin terbaru
        $points = PointHistory::with('user')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($point) {
                $typeMap = [
                    'visit_online' => 'Kunjungan Online',
                    'visit_offline' => 'Kunjungan Offline',
                    'borrow_book' => 'Peminjaman Buku',
                    'return_book' => 'Pengembalian Buku',
                ];
                $typeText = $typeMap[$point->type] ?? $point->type;
                return [
                    'id' => (string) ('point_' . $point->id),
                    'type' => 'points',
                    'title' => 'Perolehan Poin',
                    'description' => "Mendapat {$point->points} poin dari {$typeText}",
                    'user_name' => (string) ($point->user->name ?? 'System'),
                    'created_at' => (string) $point->created_at,
                    'time_ago' => (string) $point->created_at->diffForHumans(),
                ];
            });

        // Gabungkan dan urutkan
        return $activities->merge($borrowings)
            ->merge($visits)
            ->merge($points)
            ->sortByDesc('created_at')
            ->take(15)
            ->values()
            ->toArray();
    }

    private function calculateTrends(): array
    {
        $now = now();
        $lastMonth = $now->copy()->subMonth();
        $twoMonthsAgo = $now->copy()->subMonths(2);

        // Hitung trend pengguna baru
        $usersCurrentMonth = (int) User::whereBetween('created_at', [$lastMonth, $now])->count();
        $usersPreviousMonth = (int) User::whereBetween('created_at', [$twoMonthsAgo, $lastMonth])->count();
        $usersTrend = $usersPreviousMonth > 0
            ? (float) round((($usersCurrentMonth - $usersPreviousMonth) / $usersPreviousMonth) * 100, 1)
            : ($usersCurrentMonth > 0 ? 100.0 : 0.0);

        // Hitung trend peminjaman
        $borrowingsCurrentMonth = (int) Borrowing::whereBetween('borrowed_at', [$lastMonth, $now])->count();
        $borrowingsPreviousMonth = (int) Borrowing::whereBetween('borrowed_at', [$twoMonthsAgo, $lastMonth])->count();
        $borrowingsTrend = $borrowingsPreviousMonth > 0
            ? (float) round((($borrowingsCurrentMonth - $borrowingsPreviousMonth) / $borrowingsPreviousMonth) * 100, 1)
            : ($borrowingsCurrentMonth > 0 ? 100.0 : 0.0);

        // Hitung trend kunjungan
        $visitsCurrentMonth = (int) Visit::whereBetween('created_at', [$lastMonth, $now])->count();
        $visitsPreviousMonth = (int) Visit::whereBetween('created_at', [$twoMonthsAgo, $lastMonth])->count();
        $visitsTrend = $visitsPreviousMonth > 0
            ? (float) round((($visitsCurrentMonth - $visitsPreviousMonth) / $visitsPreviousMonth) * 100, 1)
            : ($visitsCurrentMonth > 0 ? 100.0 : 0.0);

        // Hitung trend poin
        $pointsCurrentMonth = (int) PointHistory::whereBetween('created_at', [$lastMonth, $now])->sum('points');
        $pointsPreviousMonth = (int) PointHistory::whereBetween('created_at', [$twoMonthsAgo, $lastMonth])->sum('points');
        $pointsTrend = $pointsPreviousMonth > 0
            ? (float) round((($pointsCurrentMonth - $pointsPreviousMonth) / $pointsPreviousMonth) * 100, 1)
            : ($pointsCurrentMonth > 0 ? 100.0 : 0.0);

        return [
            'users' => $usersTrend,
            'borrowings' => $borrowingsTrend,
            'visits' => $visitsTrend,
            'points' => $pointsTrend,
        ];
    }
}
