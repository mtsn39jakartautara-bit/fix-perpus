// resources/js/Pages/Dashboard/Index.tsx
import { motion } from "framer-motion";
import { AppShell } from "@/Layouts/AppShell";
import { Head, Link } from "@inertiajs/react";
import {
    Users,
    CalendarCheck,
    Trophy,
    BookOpen,
    Megaphone,
    TrendingUp,
    Bell,
    ChevronRight,
    Heart,
    Library,
    Award,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
    User,
    BarChart3,
    BookMarked,
    QrCode,
    Star,
    MapPin,
    Activity,
} from "lucide-react";
import { useState } from "react";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface DashboardProps {
    user: {
        name: string;
        email: string;
        role: string;
        points: number;
        barcode: string | null;
        class?: string;
        nis?: string;
        nip?: string;
        subject?: string;
    };
    userPoints: number;
    totalVisits: number;
    totalBorrowings: number;
    chartData: Array<{ month: string; points: number }>;
    topStudents: Array<{
        id: number;
        name: string;
        points: number;
        class: string;
        role: string;
    }>;
    topTeachers: Array<{
        id: number;
        name: string;
        points: number;
        subject: string;
        role: string;
    }>;
    recentActivities: Array<{
        id: number;
        type: string;
        title: string;
        description: string;
        points: number;
        created_at: string;
        time_ago: string;
    }>;
    announcements: Array<{
        id: number;
        title: string;
        date: string;
        tag: string;
        description: string;
    }>;
    notifications: Array<{
        id: string;
        title: string;
        message: string;
        type: string;
        created_at: string;
        time_ago: string;
    }>;
    rank: number;
    rankProgress: number;
    nextMilestone: number;
    pointsToNext: number;
    progressPercentage: number;
}

const fade = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
};

export default function Dashboard({
    user,
    userPoints,
    totalVisits,
    totalBorrowings,
    chartData,
    topStudents,
    topTeachers,
    recentActivities,
    announcements,
    notifications,
    rank,
    rankProgress,
    nextMilestone,
    pointsToNext,
    progressPercentage,
}: DashboardProps) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [activeTab, setActiveTab] = useState<"students" | "teachers">(
        "students"
    );
    const role = user.role;

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Selamat pagi";
        if (hour < 18) return "Selamat siang";
        return "Selamat malam";
    };

    // Chart configuration
    const chartConfig = {
        labels: chartData.map((item) => item.month),
        datasets: [
            {
                label: "Poin",
                data: chartData.map((item) => item.points),
                fill: true,

                backgroundColor: "hsla(180, 92%, 26%, 0.12)",
                borderColor: "hsl(180, 92%, 26%)",

                borderWidth: 2,
                tension: 0.4,

                pointBackgroundColor: "hsl(180, 92%, 26%)",
                pointBorderColor: "#fff",

                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
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
                ticks: {
                    stepSize: 50,
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    // Menu untuk semua role sama
    const menuItems = [
        // {
        //     route: "dashboard.index",
        //     label: "Dashboard",
        //     desc: "Halaman utama",
        //     icon: Activity,
        //     bg: "bg-sky",
        //     iconBg: "bg-blue-500 text-white",
        // },
        {
            route: "perpus.index",
            label: "Perpustakaan",
            desc: "Koleksi buku digital",
            icon: Library,
            bg: "bg-lavender",
            iconBg: "bg-violet-500 text-white",
        },
        {
            route: "visits.index",
            label: "Kunjungan",
            desc: "Scan kehadiran",
            icon: QrCode,
            bg: "bg-mint",
            iconBg: "bg-emerald-500 text-white",
        },
        {
            route: "borrowing.index",
            label: "Peminjaman",
            desc: "Kelola buku pinjam",
            icon: BookOpen,
            bg: "bg-peach",
            iconBg: "bg-rose-500 text-white",
        },
        {
            route: "wishlist.index",
            label: "Wishlist",
            desc: "Buku yang diinginkan",
            icon: Heart,
            bg: "bg-pink-200",
            iconBg: "bg-pink-500 text-white",
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <AppShell>
                <div className="mx-auto max-w-6xl px-5 pt-8 lg:px-10 lg:pt-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground">
                                    {greeting()} 👋
                                </p>
                                <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary`}
                                >
                                    {role === "student" ? "Siswa" : "Guru"}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                                Halo, {user.name}!
                            </h1>
                            {role === "student" && user.class && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Kelas {user.class} • NIS: {user.nis}
                                </p>
                            )}
                            {role === "teacher" && user.subject && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Guru {user.subject} • NIP: {user.nip}
                                </p>
                            )}
                        </div>
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setShowNotifications(!showNotifications)
                                }
                                className="relative grid h-12 w-12 place-items-center rounded-2xl bg-card shadow-soft transition-transform hover:scale-105"
                            >
                                <Bell className="h-5 w-5" />
                                {notifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive ring-2 ring-background" />
                                )}
                            </button>

                            {/* Notifications dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-card shadow-float border border-border overflow-hidden z-50">
                                    <div className="p-4 border-b border-border">
                                        <p className="font-semibold">
                                            Notifikasi
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {notifications.length} notifikasi
                                            terbaru
                                        </p>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    className={`p-4 hover:bg-muted/50 transition-colors border-b border-border/50 ${
                                                        notif.type === "danger"
                                                            ? "bg-red-50/50"
                                                            : notif.type ===
                                                              "warning"
                                                            ? "bg-yellow-50/50"
                                                            : notif.type ===
                                                              "success"
                                                            ? "bg-green-50/50"
                                                            : ""
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        {notif.type ===
                                                            "danger" && (
                                                            <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                                                        )}
                                                        {notif.type ===
                                                            "warning" && (
                                                            <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                                                        )}
                                                        {notif.type ===
                                                            "success" && (
                                                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                                        )}
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">
                                                                {notif.title}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {notif.message}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground/70 mt-1">
                                                                {notif.time_ago}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center">
                                                <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                                <p className="text-sm text-muted-foreground">
                                                    Belum ada notifikasi
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Banner Card */}
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.5 }}
                        className="relative mt-2 overflow-hidden rounded-[2rem] bg-gradient-hero p-6 text-primary-foreground shadow-float lg:p-8"
                    >
                        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
                        <div className="pointer-events-none absolute -bottom-12 right-20 h-32 w-32 rounded-full bg-mint/30 blur-2xl" />
                        <div className="relative">
                            <div className="flex items-center justify-between gap-6 flex-wrap">
                                <div className="flex-1">
                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
                                        <TrendingUp className="h-3.5 w-3.5" />
                                        Peringkat #{rank}{" "}
                                        {role === "student"
                                            ? "di tingkat"
                                            : "di sekolah"}
                                    </div>
                                    <h2 className="mt-3 text-xl font-bold lg:text-2xl">
                                        Semangat mengumpulkan poin!
                                    </h2>
                                    <p className="mt-1 text-sm text-white/85">
                                        Total poin kamu sudah{" "}
                                        <b className="text-2xl">
                                            {userPoints.toLocaleString()}
                                        </b>
                                        . Peringkat #{rank}{" "}
                                        {role === "student"
                                            ? "di kelas"
                                            : "di sekolah"}{" "}
                                        minggu ini. Tukar dengan reward menarik
                                        di toko poin.
                                    </p>

                                    {/* Progress bar */}
                                    <div className="mt-4 max-w-md">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>
                                                Menuju{" "}
                                                {nextMilestone.toLocaleString()}{" "}
                                                poin
                                            </span>
                                            <span>
                                                {pointsToNext.toLocaleString()}{" "}
                                                poin lagi
                                            </span>
                                        </div>
                                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-white/40 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${progressPercentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden h-28 w-28 shrink-0 place-items-center rounded-3xl bg-white/15 backdrop-blur md:grid">
                                    <Trophy
                                        className="h-14 w-14"
                                        strokeWidth={1.5}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    {/* Stats Cards - Poin, Kunjungan, Peminjaman */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <motion.div
                            {...fade}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="rounded-3xl bg-card p-6 shadow-soft"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-3xl font-bold text-amber-600">
                                    {userPoints.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-foreground">
                                Total Poin
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Poin yang terkumpul
                            </p>
                        </motion.div>

                        <motion.div
                            {...fade}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="rounded-3xl bg-card p-6 shadow-soft"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-3xl font-bold text-blue-600">
                                    {totalVisits.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-foreground">
                                Total Kunjungan
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Kunjungan ke perpustakaan
                            </p>
                        </motion.div>

                        <motion.div
                            {...fade}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="rounded-3xl bg-card p-6 shadow-soft"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-3xl font-bold text-primary">
                                    {totalBorrowings.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-foreground">
                                Total Peminjaman
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Buku yang pernah dipinjam
                            </p>
                        </motion.div>
                    </div>
                    {/* Chart Section */}
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        className="mt-8 rounded-3xl bg-card p-6 shadow-soft"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold tracking-tight">
                                    Grafik Poin
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Perolehan poin 6 bulan terakhir
                                </p>
                            </div>
                            <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="h-64">
                            <Line data={chartConfig} options={chartOptions} />
                        </div>
                    </motion.div>

                    {/* Top Users Section - Menampilkan sesuai role yang login */}
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.4, delay: 0.5 }}
                        className="mt-8 rounded-3xl bg-card shadow-soft overflow-hidden"
                    >
                        <div className="border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                            <div className="flex items-center justify-between px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
                                        <Trophy className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">
                                            {role === "student"
                                                ? "Top 10 Siswa Berprestasi"
                                                : "Top 10 Guru Berprestasi"}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Berdasarkan total poin yang
                                            terkumpul
                                        </p>
                                    </div>
                                </div>
                                <div className="hidden sm:block text-right">
                                    <p className="text-xs text-muted-foreground">
                                        🏆 Peringkat
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            {role === "student" ? (
                                // Tampilkan Top Students
                                <div className="space-y-2">
                                    {topStudents.length > 0 ? (
                                        topStudents.map((student, index) => {
                                            const isCurrentUser =
                                                student.name === user.name;
                                            return (
                                                <div
                                                    key={student.id}
                                                    className={`
                                    flex items-center justify-between p-4 rounded-xl transition-all duration-300
                                    ${
                                        isCurrentUser
                                            ? "bg-gradient-to-r from-primary/20 to-primary/5 border-2 border-primary shadow-lg transform scale-[1.02]"
                                            : "hover:bg-muted/30 hover:shadow-md"
                                    }
                                    ${
                                        index < 3 && !isCurrentUser
                                            ? "bg-gradient-to-r from-amber-50/50 to-transparent"
                                            : ""
                                    }
                                `}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        {/* Peringkat dengan efek khusus untuk top 3 */}
                                                        <div
                                                            className={`
                                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                                        ${
                                            index === 0
                                                ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg ring-2 ring-amber-300"
                                                : index === 1
                                                ? "bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-lg ring-2 ring-gray-300"
                                                : index === 2
                                                ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg ring-2 ring-orange-300"
                                                : isCurrentUser
                                                ? "bg-primary text-white shadow-md"
                                                : "bg-muted text-muted-foreground"
                                        }
                                    `}
                                                        >
                                                            {index + 1}
                                                        </div>

                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p
                                                                    className={`font-semibold ${
                                                                        isCurrentUser
                                                                            ? "text-primary text-base"
                                                                            : "text-sm"
                                                                    }`}
                                                                >
                                                                    {
                                                                        student.name
                                                                    }
                                                                </p>
                                                                {isCurrentUser && (
                                                                    <span className="px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full">
                                                                        Anda
                                                                    </span>
                                                                )}
                                                                {index === 0 &&
                                                                    !isCurrentUser && (
                                                                        <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                                                                            Juara
                                                                            1
                                                                        </span>
                                                                    )}
                                                                {index === 1 &&
                                                                    !isCurrentUser && (
                                                                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                                                            Juara
                                                                            2
                                                                        </span>
                                                                    )}
                                                                {index === 2 &&
                                                                    !isCurrentUser && (
                                                                        <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                                                                            Juara
                                                                            3
                                                                        </span>
                                                                    )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                Kelas{" "}
                                                                {student.class}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <p
                                                            className={`font-bold ${
                                                                isCurrentUser
                                                                    ? "text-primary text-xl"
                                                                    : "text-lg"
                                                            }`}
                                                        >
                                                            {student.points.toLocaleString()}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                                            <Award className="w-3 h-3" />
                                                            poin
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Users className="w-10 h-10 text-muted-foreground" />
                                            </div>
                                            <p className="text-muted-foreground font-medium">
                                                Belum ada data siswa
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Ajak teman-teman untuk
                                                mengumpulkan poin!
                                            </p>
                                        </div>
                                    )}

                                    {/* Highlight jika user sendiri masuk top 10 */}
                                    {topStudents.some(
                                        (s) => s.name === user.name
                                    ) && (
                                        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                                                    <Trophy className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-green-800">
                                                        🎉 Selamat! Anda masuk
                                                        dalam Top 10 siswa
                                                    </p>
                                                    <p className="text-xs text-green-600 mt-0.5">
                                                        Pertahankan prestasi
                                                        Anda dan kumpulkan lebih
                                                        banyak poin!
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Tampilkan Top Teachers
                                <div className="space-y-2">
                                    {topTeachers.length > 0 ? (
                                        topTeachers.map((teacher, index) => {
                                            const isCurrentUser =
                                                teacher.name === user.name;
                                            return (
                                                <div
                                                    key={teacher.id}
                                                    className={`
                                    flex items-center justify-between p-4 rounded-xl transition-all duration-300
                                    ${
                                        isCurrentUser
                                            ? "bg-gradient-to-r from-primary/20 to-primary/5 border-2 border-primary shadow-lg transform scale-[1.02]"
                                            : "hover:bg-muted/30 hover:shadow-md"
                                    }
                                    ${
                                        index < 3 && !isCurrentUser
                                            ? "bg-gradient-to-r from-amber-50/50 to-transparent"
                                            : ""
                                    }
                                `}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        {/* Peringkat dengan efek khusus untuk top 3 */}
                                                        <div
                                                            className={`
                                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                                        ${
                                            index === 0
                                                ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg ring-2 ring-amber-300"
                                                : index === 1
                                                ? "bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-lg ring-2 ring-gray-300"
                                                : index === 2
                                                ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg ring-2 ring-orange-300"
                                                : isCurrentUser
                                                ? "bg-primary text-white shadow-md"
                                                : "bg-muted text-muted-foreground"
                                        }
                                    `}
                                                        >
                                                            {index + 1}
                                                        </div>

                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p
                                                                    className={`font-semibold ${
                                                                        isCurrentUser
                                                                            ? "text-primary text-base"
                                                                            : "text-sm"
                                                                    }`}
                                                                >
                                                                    {
                                                                        teacher.name
                                                                    }
                                                                </p>
                                                                {isCurrentUser && (
                                                                    <span className="px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full">
                                                                        Anda
                                                                    </span>
                                                                )}
                                                                {index === 0 &&
                                                                    !isCurrentUser && (
                                                                        <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                                                                            Juara
                                                                            1
                                                                        </span>
                                                                    )}
                                                                {index === 1 &&
                                                                    !isCurrentUser && (
                                                                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                                                                            Juara
                                                                            2
                                                                        </span>
                                                                    )}
                                                                {index === 2 &&
                                                                    !isCurrentUser && (
                                                                        <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                                                                            Juara
                                                                            3
                                                                        </span>
                                                                    )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                Guru{" "}
                                                                {
                                                                    teacher.subject
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <p
                                                            className={`font-bold ${
                                                                isCurrentUser
                                                                    ? "text-primary text-xl"
                                                                    : "text-lg"
                                                            }`}
                                                        >
                                                            {teacher.points.toLocaleString()}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                                            <Award className="w-3 h-3" />
                                                            poin
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Users className="w-10 h-10 text-muted-foreground" />
                                            </div>
                                            <p className="text-muted-foreground font-medium">
                                                Belum ada data guru
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Ajak rekan guru untuk
                                                mengumpulkan poin!
                                            </p>
                                        </div>
                                    )}

                                    {/* Highlight jika user sendiri masuk top 10 */}
                                    {topTeachers.some(
                                        (t) => t.name === user.name
                                    ) && (
                                        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                                                    <Trophy className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-green-800">
                                                        🎉 Selamat! Anda masuk
                                                        dalam Top 10 guru
                                                    </p>
                                                    <p className="text-xs text-green-600 mt-0.5">
                                                        Pertahankan prestasi
                                                        Anda dan kumpulkan lebih
                                                        banyak poin!
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Menu Utama - Bento Grid */}
                    <div className="mt-8">
                        <div className="mb-4 flex items-end justify-between">
                            <h3 className="text-lg font-bold tracking-tight">
                                Menu Utama
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                            {menuItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={item.label}
                                        {...fade}
                                        transition={{
                                            duration: 0.4,
                                            delay: index * 0.06,
                                        }}
                                    >
                                        <Link
                                            href={route(item.route)}
                                            className="group block"
                                        >
                                            <div
                                                className={`relative h-full overflow-hidden rounded-[1.75rem] ${item.bg} p-5 transition-all hover:-translate-y-1 hover:shadow-float`}
                                            >
                                                <div
                                                    className={`mb-10 inline-grid h-12 w-12 place-items-center rounded-2xl ${item.iconBg} shadow-soft`}
                                                >
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                                <p className="text-base font-bold text-foreground">
                                                    {item.label}
                                                </p>
                                                <p className="mt-0.5 text-xs text-foreground/70">
                                                    {item.desc}
                                                </p>
                                                <ChevronRight className="absolute bottom-4 right-4 h-5 w-5 text-foreground/50 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                    {/* Recent Activities & Announcements */}
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Recent Activities */}
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-bold tracking-tight">
                                    Aktivitas Terbaru
                                </h3>
                                <Activity className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="space-y-3">
                                {recentActivities.length > 0 ? (
                                    recentActivities
                                        .slice(0, 5)
                                        .map((activity, index) => (
                                            <motion.div
                                                key={activity.id}
                                                {...fade}
                                                transition={{
                                                    duration: 0.4,
                                                    delay: index * 0.05,
                                                }}
                                                className="rounded-2xl bg-card p-4 shadow-soft hover:shadow-md transition-all"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div
                                                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                                activity.type ===
                                                                "visit"
                                                                    ? "bg-green-100"
                                                                    : activity.type ===
                                                                      "borrow"
                                                                    ? "bg-blue-100"
                                                                    : activity.type ===
                                                                      "return"
                                                                    ? "bg-purple-100"
                                                                    : "bg-amber-100"
                                                            }`}
                                                        >
                                                            {activity.type ===
                                                                "visit" && (
                                                                <CalendarCheck className="w-5 h-5 text-green-600" />
                                                            )}
                                                            {activity.type ===
                                                                "borrow" && (
                                                                <BookOpen className="w-5 h-5 text-blue-600" />
                                                            )}
                                                            {activity.type ===
                                                                "return" && (
                                                                <CheckCircle className="w-5 h-5 text-purple-600" />
                                                            )}
                                                            {activity.type ===
                                                                "points" && (
                                                                <Award className="w-5 h-5 text-amber-600" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-sm">
                                                                {activity.title}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                                {
                                                                    activity.description
                                                                }
                                                            </p>
                                                            <p className="text-xs text-muted-foreground/70 mt-1">
                                                                {
                                                                    activity.time_ago
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {activity.points > 0 && (
                                                        <div className="flex items-center gap-1 text-green-600">
                                                            <Award className="w-4 h-4" />
                                                            <span className="text-sm font-medium">
                                                                +
                                                                {
                                                                    activity.points
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))
                                ) : (
                                    <div className="text-center py-8 bg-card rounded-2xl">
                                        <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            Belum ada aktivitas
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Announcements */}
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-bold tracking-tight">
                                    Pengumuman
                                </h3>
                                <Megaphone className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="space-y-3">
                                {announcements.length > 0 ? (
                                    announcements.map((announcement, index) => (
                                        <motion.div
                                            key={announcement.id}
                                            {...fade}
                                            transition={{
                                                duration: 0.4,
                                                delay: index * 0.05,
                                            }}
                                            className="group cursor-pointer rounded-2xl bg-card p-4 shadow-soft transition-all hover:scale-[1.01] hover:shadow-card"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                                                    <Megaphone className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold line-clamp-1">
                                                        {announcement.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {announcement.date}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">
                                                        {
                                                            announcement.description
                                                        }
                                                    </p>
                                                </div>
                                                <span className="hidden sm:inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground whitespace-nowrap">
                                                    {announcement.tag}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 bg-card rounded-2xl">
                                        <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            Belum ada pengumuman
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </AppShell>
        </>
    );
}
