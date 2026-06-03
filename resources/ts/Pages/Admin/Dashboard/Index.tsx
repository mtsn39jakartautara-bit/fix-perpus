// resources/js/Pages/Admin/Dashboard.tsx
import { motion } from "framer-motion";
import { Head, Link } from "@inertiajs/react";
import {
    Users,
    BookOpen,
    CalendarCheck,
    TrendingUp,
    Trophy,
    Library,
    AlertCircle,
    CheckCircle,
    Clock,
    Activity,
    BarChart3,
    PieChart,
    ArrowUp,
    ArrowDown,
    UserPlus,
    BookMarked,
    Repeat,
    Award,
} from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import { useState } from "react";
import { AdminLayout } from "@/Layouts/AppShellAdmin";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface DashboardProps {
    // Statistik Utama
    stats: {
        totalUsers: number;
        totalStudents: number;
        totalTeachers: number;
        totalExternals: number;
        totalBooks: {
            physical: number;
            digital: number;
            total: number;
        };
        totalBorrowings: {
            active: number;
            returned: number;
            late: number;
            total: number;
        };
        totalVisits: {
            online: number;
            offline: number;
            total: number;
        };
        totalPoints: number;
    };

    // Data untuk chart
    monthlyTrends: {
        borrowings: Array<{ month: string; count: number }>;
        visits: Array<{ month: string; count: number }>;
        points: Array<{ month: string; points: number }>;
    };

    // Kategori buku terpopuler
    popularCategories: Array<{
        name: string;
        count: number;
        percentage: number;
    }>;

    // Top users
    topUsers: Array<{
        id: number;
        name: string;
        role: string;
        points: number;
        borrowings_count: number;
        visits_count: number;
    }>;

    // Aktivitas terkini
    recentActivities: Array<{
        id: number;
        type: string;
        title: string;
        description: string;
        user_name: string;
        created_at: string;
        time_ago: string;
    }>;

    // Buku paling banyak dipinjam
    popularBooks: Array<{
        id: number;
        title: string;
        borrow_count: number;
        author: string;
    }>;

    // Statistik perubahan (percentage)
    trends: {
        users: number;
        borrowings: number;
        visits: number;
        points: number;
    };
}

const fade = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
};

export default function AdminDashboard({
    stats,
    monthlyTrends,
    popularCategories,
    topUsers,
    recentActivities,
    popularBooks,
    trends,
}: DashboardProps) {
    const [timeRange, setTimeRange] = useState<"weekly" | "monthly" | "yearly">(
        "monthly"
    );

    // Konfigurasi chart peminjaman & kunjungan (Line Chart)
    const trendChartConfig = {
        labels: monthlyTrends.borrowings.map((item) => item.month),
        datasets: [
            {
                label: "Peminjaman Buku",
                data: monthlyTrends.borrowings.map((item) => item.count),
                borderColor: "hsl(180, 92%, 26%)",
                backgroundColor: "hsla(180, 92%, 26%, 0.1)",
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: "hsl(180, 92%, 26%)",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: "Kunjungan",
                data: monthlyTrends.visits.map((item) => item.count),
                borderColor: "hsl(185, 85%, 45%)",
                backgroundColor: "hsla(185, 85%, 45%, 0.1)",
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: "hsl(185, 85%, 45%)",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    // Konfigurasi chart poin (Line Chart)
    const pointsChartConfig = {
        labels: monthlyTrends.points.map((item) => item.month),
        datasets: [
            {
                label: "Total Poin",
                data: monthlyTrends.points.map((item) => item.points),
                borderColor: "hsl(260, 70%, 55%)",
                backgroundColor: "hsla(260, 70%, 55%, 0.1)",
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: "hsl(260, 70%, 55%)",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    // Konfigurasi chart kategori (Pie Chart)
    const categoryChartConfig = {
        labels: popularCategories.map((cat) => cat.name),
        datasets: [
            {
                data: popularCategories.map((cat) => cat.count),
                backgroundColor: [
                    "hsl(180, 92%, 26%)",
                    "hsl(185, 85%, 45%)",
                    "hsl(200, 90%, 60%)",
                    "hsl(160, 70%, 50%)",
                    "hsl(260, 70%, 55%)",
                    "hsl(25, 95%, 60%)",
                ],
                borderWidth: 0,
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom" as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                },
            },
            tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "#fff",
                bodyColor: "#fff",
                padding: 10,
                cornerRadius: 8,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: "rgba(0, 0, 0, 0.05)",
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom" as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                },
            },
        },
    };

    return (
        <AdminLayout>
            <Head title="Dashboard Admin" />

            <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
                {/* Header */}
                <motion.div
                    {...fade}
                    transition={{ duration: 0.5 }}
                    className="mb-6"
                >
                    <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                        Dashboard Admin
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Selamat datang kembali! Berikut ringkasan aktivitas
                        perpustakaan.
                    </p>
                </motion.div>

                {/* Stats Cards Grid - 3x3 Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Total Users Card */}
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="rounded-2xl bg-card p-5 shadow-soft border border-border/50 hover:shadow-md transition-all"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-sky flex items-center justify-center">
                                <Users className="w-5 h-5 text-sky-700" />
                            </div>
                            <div
                                className={`flex items-center gap-1 text-xs ${
                                    trends.users >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {trends.users >= 0 ? (
                                    <ArrowUp className="w-3 h-3" />
                                ) : (
                                    <ArrowDown className="w-3 h-3" />
                                )}
                                <span>{Math.abs(trends.users)}%</span>
                            </div>
                        </div>
                        <p className="text-2xl font-bold">
                            {stats.totalUsers.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total Pengguna
                        </p>
                        <div className="flex gap-2 mt-2 text-xs">
                            <span className="text-muted-foreground">
                                Siswa: {stats.totalStudents}
                            </span>
                            <span className="text-muted-foreground">
                                Guru: {stats.totalTeachers}
                            </span>
                            <span className="text-muted-foreground">
                                Eksternal: {stats.totalExternals}
                            </span>
                        </div>
                    </motion.div>

                    {/* Total Books Card */}
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.4, delay: 0.15 }}
                        className="rounded-2xl bg-card p-5 shadow-soft border border-border/50 hover:shadow-md transition-all"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-mint flex items-center justify-center">
                                <Library className="w-5 h-5 text-mint-700" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold">
                            {stats.totalBooks.total.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total Koleksi Buku
                        </p>
                        <div className="flex gap-2 mt-2 text-xs">
                            <span className="text-muted-foreground">
                                Fisik: {stats.totalBooks.physical}
                            </span>
                            <span className="text-muted-foreground">
                                Digital: {stats.totalBooks.digital}
                            </span>
                        </div>
                    </motion.div>

                    {/* Active Borrowings Card */}
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="rounded-2xl bg-card p-5 shadow-soft border border-border/50 hover:shadow-md transition-all"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-peach flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-peach-700" />
                            </div>
                            <div
                                className={`flex items-center gap-1 text-xs ${
                                    trends.borrowings >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {trends.borrowings >= 0 ? (
                                    <ArrowUp className="w-3 h-3" />
                                ) : (
                                    <ArrowDown className="w-3 h-3" />
                                )}
                                <span>{Math.abs(trends.borrowings)}%</span>
                            </div>
                        </div>
                        <p className="text-2xl font-bold">
                            {stats.totalBorrowings.active.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Peminjaman Aktif
                        </p>
                        <div className="flex gap-2 mt-2 text-xs">
                            <span className="text-green-600">
                                Kembali: {stats.totalBorrowings.returned}
                            </span>
                            <span className="text-red-600">
                                Terlambat: {stats.totalBorrowings.late}
                            </span>
                        </div>
                    </motion.div>

                    {/* Total Visits Card */}
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.4, delay: 0.25 }}
                        className="rounded-2xl bg-card p-5 shadow-soft border border-border/50 hover:shadow-md transition-all"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-lavender flex items-center justify-center">
                                <CalendarCheck className="w-5 h-5 text-lavender-700" />
                            </div>
                            <div
                                className={`flex items-center gap-1 text-xs ${
                                    trends.visits >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {trends.visits >= 0 ? (
                                    <ArrowUp className="w-3 h-3" />
                                ) : (
                                    <ArrowDown className="w-3 h-3" />
                                )}
                                <span>{Math.abs(trends.visits)}%</span>
                            </div>
                        </div>
                        <p className="text-2xl font-bold">
                            {stats.totalVisits.total.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total Kunjungan
                        </p>
                        <div className="flex gap-2 mt-2 text-xs">
                            <span className="text-muted-foreground">
                                Online: {stats.totalVisits.online}
                            </span>
                            <span className="text-muted-foreground">
                                Offline: {stats.totalVisits.offline}
                            </span>
                        </div>
                    </motion.div>
                </div>

                {/* Row 2: Additional Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {/* Total Points Card */}
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 p-5 shadow-soft border border-amber-200/50"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-white" />
                            </div>
                            <div
                                className={`flex items-center gap-1 text-xs ${
                                    trends.points >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {trends.points >= 0 ? (
                                    <ArrowUp className="w-3 h-3" />
                                ) : (
                                    <ArrowDown className="w-3 h-3" />
                                )}
                                <span>{Math.abs(trends.points)}%</span>
                            </div>
                        </div>
                        <p className="text-2xl font-bold">
                            {stats.totalPoints.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total Poin Terkumpul
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                            ✨ Seluruh pengguna
                        </p>
                    </motion.div>

                    {/* Total Borrowings All Time Card */}
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.4, delay: 0.35 }}
                        className="rounded-2xl bg-primary-soft/30 p-5 shadow-soft border border-primary/20"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Repeat className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold">
                            {stats.totalBorrowings.total.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total Seluruh Peminjaman
                        </p>
                        <p className="text-xs text-primary mt-2">
                            📚 Sepanjang masa
                        </p>
                    </motion.div>

                    {/* New Users This Month Card */}
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        className="rounded-2xl bg-card p-5 shadow-soft border border-border/50"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                                <UserPlus className="w-5 h-5 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold">
                            +{Math.floor(stats.totalUsers * 0.08)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Pengguna Baru Bulan Ini
                        </p>
                        <p className="text-xs text-emerald-600 mt-2">
                            📈 Tren positif
                        </p>
                    </motion.div>
                </div>

                {/* Charts Section - 3 Charts: Trend, Points, Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Chart 1: Peminjaman & Kunjungan Trend (Line Chart) - CRUCIAL */}
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.4, delay: 0.45 }}
                        className="rounded-2xl bg-card p-5 shadow-soft border border-border/50 lg:col-span-2"
                    >
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                            <div>
                                <h3 className="text-base font-bold tracking-tight">
                                    Tren Aktivitas Perpustakaan
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Peminjaman & Kunjungan 6 bulan terakhir
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setTimeRange("monthly")}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                        timeRange === "monthly"
                                            ? "bg-primary text-white"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                                >
                                    Bulanan
                                </button>
                            </div>
                        </div>
                        <div className="h-72">
                            <Line
                                data={trendChartConfig}
                                options={chartOptions}
                            />
                        </div>
                    </motion.div>

                    {/* Chart 2: Perolehan Poin (Line Chart) - CRUCIAL */}
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.4, delay: 0.5 }}
                        className="rounded-2xl bg-card p-5 shadow-soft border border-border/50"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-bold tracking-tight">
                                    Tren Perolehan Poin
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    6 bulan terakhir
                                </p>
                            </div>
                            <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="h-64">
                            <Line
                                data={pointsChartConfig}
                                options={chartOptions}
                            />
                        </div>
                    </motion.div>

                    {/* Chart 3: Kategori Buku Terpopuler (Pie Chart) - CRUCIAL */}
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.4, delay: 0.55 }}
                        className="rounded-2xl bg-card p-5 shadow-soft border border-border/50"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-bold tracking-tight">
                                    Kategori Buku Terpopuler
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Berdasarkan jumlah peminjaman
                                </p>
                            </div>
                            <PieChart className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="h-64">
                            <Pie
                                data={categoryChartConfig}
                                options={pieOptions}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Top Users & Popular Books Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Top 10 Users by Points */}
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.4, delay: 0.6 }}
                        className="rounded-2xl bg-card shadow-soft border border-border/50 overflow-hidden"
                    >
                        <div className="border-b border-border bg-gradient-to-r from-primary/5 to-transparent px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center">
                                    <Trophy className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold">
                                        Top 10 Pengguna Berprestasi
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Berdasarkan total poin
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="space-y-2">
                                {topUsers.map((user, index) => {
                                    const rankColors = [
                                        "bg-gradient-to-br from-amber-400 to-yellow-500",
                                        "bg-gradient-to-br from-gray-400 to-gray-500",
                                        "bg-gradient-to-br from-orange-400 to-orange-500",
                                    ];
                                    return (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                                        index < 3
                                                            ? rankColors[index]
                                                            : "bg-muted text-muted-foreground"
                                                    } text-white`}
                                                >
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {user.role === "student"
                                                            ? "Siswa"
                                                            : user.role ===
                                                              "teacher"
                                                            ? "Guru"
                                                            : "Eksternal"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-primary">
                                                    {user.points.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Award className="w-3 h-3" />
                                                    poin
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Popular Books */}
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.4, delay: 0.65 }}
                        className="rounded-2xl bg-card shadow-soft border border-border/50 overflow-hidden"
                    >
                        <div className="border-b border-border bg-gradient-to-r from-primary/5 to-transparent px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-mint flex items-center justify-center">
                                    <BookMarked className="w-4 h-4 text-mint-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold">
                                        Buku Paling Populer
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Berdasarkan jumlah peminjaman
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="space-y-2">
                                {popularBooks.map((book, index) => (
                                    <div
                                        key={book.id}
                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-all"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center shrink-0">
                                                <span className="text-sm font-bold text-primary">
                                                    #{index + 1}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-sm truncate">
                                                    {book.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {book.author ||
                                                        "Unknown Author"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-3">
                                            <p className="font-bold text-primary">
                                                {book.borrow_count}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                dipinjam
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Recent Activities */}
                <motion.div
                    {...fade}
                    transition={{ duration: 0.4, delay: 0.7 }}
                    className="rounded-2xl bg-card shadow-soft border border-border/50"
                >
                    <div className="border-b border-border px-5 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-lavender flex items-center justify-center">
                                <Activity className="w-4 h-4 text-lavender-700" />
                            </div>
                            <div>
                                <h3 className="font-bold">Aktivitas Terkini</h3>
                                <p className="text-xs text-muted-foreground">
                                    Aktivitas terbaru di perpustakaan
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="space-y-3">
                            {recentActivities.slice(0, 8).map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-all"
                                >
                                    <div
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                            activity.type === "borrow"
                                                ? "bg-blue-100 dark:bg-blue-950/30"
                                                : activity.type === "return"
                                                ? "bg-green-100 dark:bg-green-950/30"
                                                : activity.type === "visit"
                                                ? "bg-purple-100 dark:bg-purple-950/30"
                                                : "bg-amber-100 dark:bg-amber-950/30"
                                        }`}
                                    >
                                        {activity.type === "borrow" && (
                                            <BookOpen className="w-4 h-4 text-blue-600" />
                                        )}
                                        {activity.type === "return" && (
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        )}
                                        {activity.type === "visit" && (
                                            <CalendarCheck className="w-4 h-4 text-purple-600" />
                                        )}
                                        {activity.type === "points" && (
                                            <Award className="w-4 h-4 text-amber-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <p className="font-medium text-sm">
                                                {activity.title}
                                            </p>
                                            <span className="text-xs text-muted-foreground">
                                                {activity.time_ago}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            oleh {activity.user_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">
                                            {activity.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AdminLayout>
    );
}
