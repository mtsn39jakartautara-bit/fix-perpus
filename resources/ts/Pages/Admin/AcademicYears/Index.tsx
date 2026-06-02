import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, router } from "@inertiajs/react";
import {
    Calendar,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Grid3x3,
    List,
    Users,
    CheckCircle,
    XCircle,
    Star,
    AlertCircle,
} from "lucide-react";
import { AdminLayout } from "@/Layouts/AppShellAdmin";
import { AcademicYear } from "@/types/academic-year";

interface Props {
    academicYears: {
        data: AcademicYear[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: any[];
    };
    filters: {
        search: string;
        status: string;
        sort: string;
        direction: string;
    };
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

export default function AcademicYearsIndex({ academicYears, filters }: Props) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [search, setSearch] = useState(filters.search || "");
    const [statusFilter, setStatusFilter] = useState(filters.status || "");
    const [showFilters, setShowFilters] = useState(false);
    const [yearToDelete, setYearToDelete] = useState<AcademicYear | null>(null);

    const handleSearch = () => {
        router.get(
            route("admin.academic-years.index"),
            {
                search: search,
                status: statusFilter,
                sort: filters.sort,
                direction: filters.direction,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleFilterChange = (key: string, value: any) => {
        router.get(
            route("admin.academic-years.index"),
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

    const handleDelete = () => {
        if (yearToDelete) {
            router.delete(
                route("admin.academic-years.destroy", yearToDelete.id),
                {
                    onSuccess: () => {
                        setYearToDelete(null);
                    },
                }
            );
        }
    };

    const handleSetActive = (academicYear: AcademicYear) => {
        if (
            confirm(
                `Apakah Anda yakin ingin mengaktifkan tahun ajaran "${academicYear.name}"?`
            )
        ) {
            router.post(
                route("admin.academic-years.set-active", academicYear.id),
                {},
                {
                    preserveScroll: true,
                }
            );
        }
    };

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("");
        router.get(
            route("admin.academic-years.index"),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const activeYear = academicYears.data.find((y) => y.is_active);

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
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                                        Manajemen Tahun Ajaran
                                    </h1>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Kelola periode tahun ajaran sekolah
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Link
                            href={route("admin.academic-years.create")}
                            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:scale-105 hover:shadow-lg"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Tahun Ajaran
                        </Link>
                    </div>
                </motion.div>

                {/* Active Year Banner */}
                {activeYear && (
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.4, delay: 0.05 }}
                        className="mb-6 rounded-2xl bg-primary/10 p-4 border border-primary/20"
                    >
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <Star className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        Tahun Ajaran Aktif:{" "}
                                        <span className="font-bold text-primary">
                                            {activeYear.name}
                                        </span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Periode ini digunakan untuk data kelas
                                        dan pendaftaran siswa
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Stats Cards */}
                <motion.div
                    {...fade}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-3xl font-bold text-primary">
                                {academicYears.total}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Total Tahun Ajaran
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Seluruh periode terdaftar
                        </p>
                    </div>
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="text-3xl font-bold text-green-600">
                                {
                                    academicYears.data.filter(
                                        (y) => y.is_active
                                    ).length
                                }
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Tahun Aktif
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Sedang berjalan
                        </p>
                    </div>
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="text-3xl font-bold text-blue-600">
                                {academicYears.data.reduce(
                                    (sum, year) =>
                                        sum + (year.students_count || 0),
                                    0
                                )}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Total Pendaftaran
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Seluruh siswa terdaftar
                        </p>
                    </div>
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                                <Star className="w-6 h-6 text-orange-600" />
                            </div>
                            <span className="text-3xl font-bold text-orange-600">
                                {activeYear
                                    ? activeYear.students_count || 0
                                    : 0}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Siswa Aktif
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Di tahun ajaran berjalan
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
                                    onKeyPress={(e) =>
                                        e.key === "Enter" && handleSearch()
                                    }
                                    placeholder="Cari tahun ajaran (contoh: 2024/2025)..."
                                    className="h-12 w-full rounded-2xl border-border bg-card pl-11 pr-4 text-sm shadow-soft focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
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
                                    filters.sort !== "name"
                                        ? "bg-primary text-white"
                                        : "bg-card text-foreground shadow-soft hover:bg-muted"
                                }`}
                            >
                                <Filter className="h-4 w-4" />
                                Filter
                                {(filters.status ||
                                    filters.sort !== "name") && (
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
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                Status
                                            </label>
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => {
                                                    setStatusFilter(
                                                        e.target.value
                                                    );
                                                    handleFilterChange(
                                                        "status",
                                                        e.target.value
                                                    );
                                                }}
                                                className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="">
                                                    Semua Status
                                                </option>
                                                <option value="active">
                                                    Aktif
                                                </option>
                                                <option value="inactive">
                                                    Tidak Aktif
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                Urutkan Berdasarkan
                                            </label>
                                            <select
                                                value={filters.sort || "name"}
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        "sort",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="name">
                                                    Nama Tahun Ajaran
                                                </option>
                                                <option value="created_at">
                                                    Terbaru
                                                </option>
                                                <option value="updated_at">
                                                    Terakhir Diupdate
                                                </option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                Urutan
                                            </label>
                                            <select
                                                value={
                                                    filters.direction || "desc"
                                                }
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        "direction",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="desc">
                                                    Descending (Terbaru ke Lama)
                                                </option>
                                                <option value="asc">
                                                    Ascending (Terlama ke Baru)
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Academic Years Grid/List */}
                {academicYears.data.length > 0 ? (
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
                        {academicYears.data.map((year) =>
                            viewMode === "grid" ? (
                                <AcademicYearCardGrid
                                    key={year.id}
                                    academicYear={year}
                                    onDelete={() => setYearToDelete(year)}
                                    onSetActive={() => handleSetActive(year)}
                                />
                            ) : (
                                <AcademicYearCardList
                                    key={year.id}
                                    academicYear={year}
                                    onDelete={() => setYearToDelete(year)}
                                    onSetActive={() => handleSetActive(year)}
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
                            <Calendar className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">
                            Belum ada data tahun ajaran
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Mulai tambahkan periode tahun ajaran sekolah
                        </p>
                        <Link
                            href={route("admin.academic-years.create")}
                            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:scale-105 mt-4"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Tahun Ajaran
                        </Link>
                    </motion.div>
                )}

                {/* Pagination */}
                {academicYears.last_page > 1 && (
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="mt-8 flex items-center justify-center gap-2"
                    >
                        <Link
                            href={academicYears.links[0]?.url || "#"}
                            className={`rounded-xl p-2 transition-all ${
                                academicYears.current_page === 1
                                    ? "cursor-not-allowed opacity-50"
                                    : "hover:bg-muted"
                            }`}
                            preserveScroll
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex gap-1">
                            {Array.from(
                                {
                                    length: Math.min(
                                        5,
                                        academicYears.last_page
                                    ),
                                },
                                (_, i) => {
                                    let pageNum;
                                    if (academicYears.last_page <= 5) {
                                        pageNum = i + 1;
                                    } else if (
                                        academicYears.current_page <= 3
                                    ) {
                                        pageNum = i + 1;
                                    } else if (
                                        academicYears.current_page >=
                                        academicYears.last_page - 2
                                    ) {
                                        pageNum =
                                            academicYears.last_page - 4 + i;
                                    } else {
                                        pageNum =
                                            academicYears.current_page - 2 + i;
                                    }
                                    return (
                                        <Link
                                            key={pageNum}
                                            href={route(
                                                "admin.academic-years.index",
                                                {
                                                    page: pageNum,
                                                    ...filters,
                                                }
                                            )}
                                            className={`rounded-xl px-4 py-2 text-sm transition-all ${
                                                academicYears.current_page ===
                                                pageNum
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
                                academicYears.links[
                                    academicYears.links.length - 1
                                ]?.url || "#"
                            }
                            className={`rounded-xl p-2 transition-all ${
                                academicYears.current_page ===
                                academicYears.last_page
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

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {yearToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        onClick={() => setYearToDelete(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md rounded-3xl bg-card p-6 shadow-float"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                    <Trash2 className="h-8 w-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-semibold">
                                    Hapus Tahun Ajaran
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Apakah Anda yakin ingin menghapus tahun
                                    ajaran "{yearToDelete.name}"?
                                    {yearToDelete.students_count &&
                                    yearToDelete.students_count > 0 ? (
                                        <span className="block mt-2 text-red-600">
                                            ⚠️ Tahun ajaran ini memiliki{" "}
                                            {yearToDelete.students_count} siswa
                                            terdaftar. Tidak dapat dihapus!
                                        </span>
                                    ) : (
                                        " Tindakan ini tidak dapat dibatalkan."
                                    )}
                                </p>
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => setYearToDelete(null)}
                                        className="flex-1 rounded-xl border-border bg-background px-4 py-2.5 text-sm font-medium transition-all hover:bg-muted"
                                    >
                                        Batal
                                    </button>
                                    {(!yearToDelete.students_count ||
                                        yearToDelete.students_count === 0) && (
                                        <button
                                            onClick={handleDelete}
                                            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-700"
                                        >
                                            Hapus
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}

// Grid Card Component
function AcademicYearCardGrid({
    academicYear,
    onDelete,
    onSetActive,
}: {
    academicYear: AcademicYear;
    onDelete: () => void;
    onSetActive: () => void;
}) {
    const studentCount = academicYear.students_count || 0;
    const colors = [
        "from-primary/20 to-primary/10",
        "from-blue-500/20 to-blue-500/10",
        "from-emerald-500/20 to-emerald-500/10",
        "from-purple-500/20 to-purple-500/10",
        "from-orange-500/20 to-orange-500/10",
        "from-pink-500/20 to-pink-500/10",
    ];
    const colorIndex = academicYear.id % colors.length;
    const bgGradient = colors[colorIndex];

    return (
        <motion.div variants={fade} className="group">
            <div className="relative overflow-hidden rounded-3xl bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-lg">
                {/* Gradient Header */}
                <div
                    className={`h-28 bg-gradient-to-r ${bgGradient} relative overflow-hidden`}
                >
                    <div className="absolute inset-0 bg-black/5"></div>
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/20"></div>
                    <div className="absolute -right-12 -bottom-12 w-32 h-32 rounded-full bg-white/10"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-primary/40" />
                    </div>
                    {academicYear.is_active && (
                        <div className="absolute top-3 right-3">
                            <span className="rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white shadow-sm flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                Aktif
                            </span>
                        </div>
                    )}
                </div>

                <div className="p-5">
                    <h3 className="font-bold text-lg mb-1">
                        {academicYear.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Users className="h-4 w-4" />
                        <span>{studentCount} Siswa</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                            Dibuat:{" "}
                            {new Date(
                                academicYear.created_at
                            ).toLocaleDateString("id-ID")}
                        </div>
                        <div className="flex items-center gap-2">
                            {!academicYear.is_active && (
                                <button
                                    onClick={onSetActive}
                                    className="rounded-xl bg-primary/10 p-2 text-primary transition-all hover:bg-primary/20 hover:scale-105"
                                    title="Set Aktif"
                                >
                                    <Star className="h-4 w-4" />
                                </button>
                            )}
                            <Link
                                href={route(
                                    "admin.academic-years.edit",
                                    academicYear.id
                                )}
                                className="rounded-xl bg-card p-2 text-foreground shadow-soft transition-all hover:bg-muted hover:scale-105"
                                title="Edit Tahun Ajaran"
                            >
                                <Edit className="h-4 w-4" />
                            </Link>
                            <button
                                onClick={onDelete}
                                className="rounded-xl bg-card p-2 text-red-600 shadow-soft transition-all hover:bg-red-50 hover:scale-105"
                                title="Hapus Tahun Ajaran"
                                disabled={studentCount > 0}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// List Card Component
function AcademicYearCardList({
    academicYear,
    onDelete,
    onSetActive,
}: {
    academicYear: AcademicYear;
    onDelete: () => void;
    onSetActive: () => void;
}) {
    const studentCount = academicYear.students_count || 0;

    return (
        <motion.div variants={fade} className="group">
            <div className="rounded-3xl bg-card p-5 shadow-soft transition-all hover:shadow-lg">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-bold text-lg">
                                        {academicYear.name}
                                    </h3>
                                    {academicYear.is_active ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                            <Star className="h-3 w-3" />
                                            Aktif
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                            <XCircle className="h-3 w-3" />
                                            Tidak Aktif
                                        </span>
                                    )}
                                </div>
                                <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>
                                            {studentCount} Siswa Terdaftar
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            Dibuat:{" "}
                                            {new Date(
                                                academicYear.created_at
                                            ).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!academicYear.is_active && (
                            <button
                                onClick={onSetActive}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm text-primary transition-all hover:bg-primary/20"
                            >
                                <Star className="h-4 w-4" />
                                Set Aktif
                            </button>
                        )}
                        <Link
                            href={route(
                                "admin.academic-years.edit",
                                academicYear.id
                            )}
                            className="inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2 text-sm shadow-soft transition-all hover:bg-muted"
                        >
                            <Edit className="h-4 w-4" />
                            Edit
                        </Link>
                        <button
                            onClick={onDelete}
                            className="inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2 text-sm text-red-600 shadow-soft transition-all hover:bg-red-50"
                            disabled={studentCount > 0}
                        >
                            <Trash2 className="h-4 w-4" />
                            Hapus
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
