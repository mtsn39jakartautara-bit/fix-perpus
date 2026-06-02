// resources/js/Pages/Admin/Users/Students.tsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, router } from "@inertiajs/react";
import {
    Users,
    Search,
    Filter,
    Eye,
    ChevronLeft,
    ChevronRight,
    Grid3x3,
    List,
    GraduationCap,
    Mail,
    MapPin,
    Smartphone,
    UserCheck,
    UserX,
    Clock,
    Calendar,
    BookOpen,
    Award,
} from "lucide-react";
import { AdminLayout } from "@/Layouts/AppShellAdmin";
import { User } from "@/types/user";

interface Props {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: any[];
    };
    filters: {
        search: string;
        status: string;
        class_id: string;
        sort: string;
        direction: string;
    };
    classes: Array<{ id: number; name: string; level: number }>;
    statuses: Record<string, string>;
    activeAcademicYear: { id: number; name: string } | null;
}

const fade = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
};

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const statusConfig: Record<
    string,
    { label: string; color: string; bg: string }
> = {
    active: { label: "Aktif", color: "text-green-600", bg: "bg-green-100" },
    graduated: { label: "Lulus", color: "text-blue-600", bg: "bg-blue-100" },
    transferred: {
        label: "Pindah",
        color: "text-orange-600",
        bg: "bg-orange-100",
    },
    dropped: { label: "Drop Out", color: "text-red-600", bg: "bg-red-100" },
};

export default function Students({
    users,
    filters,
    classes,
    statuses,
    activeAcademicYear,
}: Props) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [search, setSearch] = useState(filters.search || "");
    const [statusFilter, setStatusFilter] = useState(filters.status || "");
    const [classFilter, setClassFilter] = useState(filters.class_id || "");
    const [showFilters, setShowFilters] = useState(false);
    const [sort, setSort] = useState(filters.sort || "created_at");
    const [direction, setDirection] = useState(filters.direction || "desc");

    // Apply filters with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            applyFilters();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const applyFilters = () => {
        router.get(
            route("admin.users.students"),
            {
                search: search,
                status: statusFilter,
                class_id: classFilter,
                sort: sort,
                direction: direction,
                page: 1,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleFilterChange = (key: string, value: any) => {
        if (key === "sort") {
            setSort(value);
        } else if (key === "direction") {
            setDirection(value);
        } else if (key === "status") {
            setStatusFilter(value);
        } else if (key === "class_id") {
            setClassFilter(value);
        }

        router.get(
            route("admin.users.students"),
            {
                ...filters,
                [key]: value,
                page: 1,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("");
        setClassFilter("");
        setSort("created_at");
        setDirection("desc");
        router.get(
            route("admin.users.students"),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const getStudentClass = (user: User) => {
        return user.student?.current_class?.name || "-";
    };

    const getAcademicYear = (user: User) => {
        return user.student?.academic_year?.name || "-";
    };

    // Calculate statistics
    const activeStudents = users.data.filter(
        (u) => u.student?.status === "active"
    ).length;
    const graduatedStudents = users.data.filter(
        (u) => u.student?.status === "graduated"
    ).length;
    const studentsWithClass = users.data.filter(
        (u) => u.student?.current_class
    ).length;
    const totalPoints = users.data.reduce(
        (sum, u) => sum + (u.total_points || 0),
        0
    );

    return (
        <AdminLayout>
            <div className="mx-auto max-w-7xl px-5 pt-8 lg:px-10 lg:pt-10">
                {/* Header */}
                <motion.div
                    {...fade}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                                    <GraduationCap className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                                        Manajemen Siswa
                                    </h1>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Kelola data siswa perpustakaan
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {activeAcademicYear && (
                                <div className="rounded-xl bg-primary-soft px-4 py-2.5 text-sm">
                                    <span className="text-muted-foreground">
                                        Tahun Ajaran Aktif:{" "}
                                    </span>
                                    <span className="font-medium text-primary">
                                        {activeAcademicYear.name}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    {...fade}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
                >
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-3xl font-bold text-primary">
                                {users.total}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Total Siswa
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Seluruh siswa terdaftar
                        </p>
                    </div>
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                                <UserCheck className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="text-3xl font-bold text-green-600">
                                {activeStudents}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Siswa Aktif
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Status aktif
                        </p>
                    </div>
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="text-3xl font-bold text-blue-600">
                                {studentsWithClass}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Memiliki Kelas
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Terdaftar di kelas aktif
                        </p>
                    </div>
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
                                <Award className="w-6 h-6 text-purple-600" />
                            </div>
                            <span className="text-3xl font-bold text-purple-600">
                                {graduatedStudents}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Lulus
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Telah menyelesaikan studi
                        </p>
                    </div>
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                            <span className="text-3xl font-bold text-orange-600">
                                {totalPoints}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Total Poin
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Akumulasi poin siswa
                        </p>
                    </div>
                </motion.div>

                {/* Search and Filters */}
                <motion.div
                    {...fade}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="mb-6"
                >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-1 gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari siswa berdasarkan nama, email, atau NIS..."
                                    className="h-12 w-full rounded-2xl border-border bg-card pl-11 pr-4 text-sm shadow-soft focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <button
                                onClick={applyFilters}
                                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:scale-105"
                            >
                                <Search className="h-4 w-4" />
                                Cari
                            </button>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-medium transition-all ${
                                    showFilters ||
                                    filters.status ||
                                    filters.class_id ||
                                    filters.sort !== "created_at"
                                        ? "bg-primary text-white"
                                        : "bg-card text-foreground shadow-soft hover:bg-muted"
                                }`}
                            >
                                <Filter className="h-4 w-4" />
                                Filter
                                {(filters.status ||
                                    filters.class_id ||
                                    filters.sort !== "created_at") && (
                                    <span className="ml-1 h-2 w-2 rounded-full bg-white" />
                                )}
                            </button>
                            <div className="hidden lg:flex gap-2 rounded-2xl bg-card p-1 shadow-soft">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`rounded-xl p-2 transition-all ${
                                        viewMode === "grid"
                                            ? "bg-primary text-white"
                                            : "text-muted-foreground hover:bg-muted"
                                    }`}
                                >
                                    <Grid3x3 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`rounded-xl p-2 transition-all ${
                                        viewMode === "list"
                                            ? "bg-primary text-white"
                                            : "text-muted-foreground hover:bg-muted"
                                    }`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-4 overflow-hidden"
                            >
                                <div className="rounded-3xl bg-card p-5 shadow-soft">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold">
                                            Filter Pencarian
                                        </h3>
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            Reset Filter
                                        </button>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-4">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                Status Siswa
                                            </label>
                                            <select
                                                value={statusFilter}
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        "status",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="">
                                                    Semua Status
                                                </option>
                                                {Object.entries(statuses).map(
                                                    ([key, label]) => (
                                                        <option
                                                            key={key}
                                                            value={key}
                                                        >
                                                            {label}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                Kelas
                                            </label>
                                            <select
                                                value={classFilter}
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        "class_id",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="">
                                                    Semua Kelas
                                                </option>
                                                {classes.map((cls) => (
                                                    <option
                                                        key={cls.id}
                                                        value={cls.id}
                                                    >
                                                        Kelas {cls.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                Urutkan Berdasarkan
                                            </label>
                                            <select
                                                value={sort}
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        "sort",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="created_at">
                                                    Terbaru
                                                </option>
                                                <option value="name">
                                                    Nama (A-Z)
                                                </option>
                                                <option value="nis">NIS</option>
                                                <option value="class_name">
                                                    Kelas
                                                </option>
                                                <option value="total_points">
                                                    Total Poin
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                Urutan
                                            </label>
                                            <select
                                                value={direction}
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        "direction",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="asc">
                                                    Naik (↑)
                                                </option>
                                                <option value="desc">
                                                    Turun (↓)
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Users Grid/List */}
                {users.data.length > 0 ? (
                    <motion.div
                        variants={stagger}
                        initial="initial"
                        animate="animate"
                        className={
                            viewMode === "grid"
                                ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                : "space-y-4"
                        }
                    >
                        {users.data.map((user) =>
                            viewMode === "grid" ? (
                                <StudentCardGrid
                                    key={user.id}
                                    user={user}
                                    getStudentClass={getStudentClass}
                                    getAcademicYear={getAcademicYear}
                                />
                            ) : (
                                <StudentCardList
                                    key={user.id}
                                    user={user}
                                    getStudentClass={getStudentClass}
                                    getAcademicYear={getAcademicYear}
                                />
                            )
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.3 }}
                        className="rounded-3xl bg-card py-16 text-center shadow-soft"
                    >
                        <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                            <GraduationCap className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">
                            Belum ada data siswa
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Belum ada siswa yang terdaftar di sistem
                        </p>
                    </motion.div>
                )}

                {/* Pagination */}
                {users.last_page > 1 && (
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="mt-8 flex items-center justify-center gap-2"
                    >
                        <Link
                            href={users.links[0]?.url || "#"}
                            className={`rounded-xl p-2 transition-all ${
                                users.current_page === 1
                                    ? "cursor-not-allowed opacity-50"
                                    : "hover:bg-muted"
                            }`}
                            preserveScroll
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex gap-1">
                            {Array.from(
                                { length: Math.min(5, users.last_page) },
                                (_, i) => {
                                    let pageNum;
                                    if (users.last_page <= 5) {
                                        pageNum = i + 1;
                                    } else if (users.current_page <= 3) {
                                        pageNum = i + 1;
                                    } else if (
                                        users.current_page >=
                                        users.last_page - 2
                                    ) {
                                        pageNum = users.last_page - 4 + i;
                                    } else {
                                        pageNum = users.current_page - 2 + i;
                                    }
                                    return (
                                        <Link
                                            key={pageNum}
                                            href={route(
                                                "admin.users.students",
                                                {
                                                    page: pageNum,
                                                    ...filters,
                                                }
                                            )}
                                            className={`rounded-xl px-4 py-2 text-sm transition-all ${
                                                users.current_page === pageNum
                                                    ? "bg-primary text-white shadow-soft"
                                                    : "hover:bg-muted"
                                            }`}
                                            preserveScroll
                                        >
                                            {pageNum}
                                        </Link>
                                    );
                                }
                            )}
                        </div>
                        <Link
                            href={
                                users.links[users.links.length - 1]?.url || "#"
                            }
                            className={`rounded-xl p-2 transition-all ${
                                users.current_page === users.last_page
                                    ? "cursor-not-allowed opacity-50"
                                    : "hover:bg-muted"
                            }`}
                            preserveScroll
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Link>
                    </motion.div>
                )}
            </div>
        </AdminLayout>
    );
}

// Grid Card Component
function StudentCardGrid({
    user,
    getStudentClass,
    getAcademicYear,
}: {
    user: User;
    getStudentClass: (user: User) => string;
    getAcademicYear: (user: User) => string;
}) {
    const status = user.student?.status || "active";
    const statusInfo =
        statusConfig[status as keyof typeof statusConfig] ||
        statusConfig.active;
    const currentClass = getStudentClass(user);
    const hasClass = currentClass !== "-";

    return (
        <motion.div variants={fade} className="group">
            <div className="relative overflow-hidden rounded-3xl bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div
                            className={`rounded-full px-2 py-1 text-xs font-medium ${statusInfo?.bg} ${statusInfo?.color}`}
                        >
                            {statusInfo?.label}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-2">
                        <h3 className="font-bold line-clamp-1">{user.name}</h3>
                        <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3 flex-shrink-0" />
                                <span>NIS: {user.student?.nis || "-"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="line-clamp-1">
                                    {user.email}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3 flex-shrink-0" />
                                <span
                                    className={
                                        hasClass
                                            ? "font-medium text-primary"
                                            : ""
                                    }
                                >
                                    Kelas: {currentClass}
                                </span>
                            </div>
                            {user.student?.academic_year && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 flex-shrink-0" />
                                    <span>TA: {getAcademicYear(user)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Points */}
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-bold text-primary">
                                    P
                                </span>
                            </div>
                            <span className="text-sm font-semibold text-primary">
                                {user.total_points || 0}
                            </span>
                        </div>
                        <Link
                            href={route("admin.users.show.student", user.id)}
                            className="rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-primary/90"
                        >
                            Detail
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// List Card Component
function StudentCardList({
    user,
    getStudentClass,
    getAcademicYear,
}: {
    user: User;
    getStudentClass: (user: User) => string;
    getAcademicYear: (user: User) => string;
}) {
    const status = user.student?.status || "active";
    const statusInfo =
        statusConfig[status as keyof typeof statusConfig] ||
        statusConfig.active;
    const currentClass = getStudentClass(user);
    const hasClass = currentClass !== "-";

    return (
        <motion.div variants={fade} className="group">
            <div className="rounded-3xl bg-card p-5 shadow-soft transition-all hover:shadow-lg">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xl font-bold text-primary">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-bold">{user.name}</h3>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo?.bg} ${statusInfo?.color}`}
                                    >
                                        {statusInfo?.label}
                                    </span>
                                </div>
                                <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-5">
                                    <div className="flex items-center gap-1">
                                        <GraduationCap className="h-3 w-3 flex-shrink-0" />
                                        <span>
                                            NIS: {user.student?.nis || "-"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">
                                            {user.email}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BookOpen className="h-3 w-3 flex-shrink-0" />
                                        <span
                                            className={
                                                hasClass
                                                    ? "font-medium text-primary"
                                                    : ""
                                            }
                                        >
                                            Kelas: {currentClass}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 flex-shrink-0" />
                                        <span>TA: {getAcademicYear(user)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Smartphone className="h-3 w-3 flex-shrink-0" />
                                        <span>
                                            HP:{" "}
                                            {user.student?.parent_phone || "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                                {user.total_points || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Total Poin
                            </div>
                        </div>
                        <Link
                            href={route("admin.users.show.student", user.id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-soft transition-all hover:bg-primary/90"
                        >
                            <Eye className="h-4 w-4" />
                            Detail
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
