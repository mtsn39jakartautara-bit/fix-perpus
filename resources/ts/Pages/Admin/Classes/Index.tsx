import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, router } from "@inertiajs/react";
import {
    GraduationCap,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
    Grid3x3,
    List,
    Users,
    BookOpen,
    Calendar,
    TrendingUp,
    ChevronDown,
} from "lucide-react";
import { AdminLayout } from "@/Layouts/AppShellAdmin";
import { Class } from "@/types/class";

interface Props {
    classes: {
        data: Class[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: any[];
    };
    filters: {
        search: string;
        level: string;
        sort: string;
        direction: string;
    };
    levels: number[];
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

export default function ClassesIndex({
    classes,
    filters,
    levels,
    activeAcademicYear,
}: Props) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [search, setSearch] = useState(filters.search || "");
    const [levelFilter, setLevelFilter] = useState(filters.level || "");
    const [showFilters, setShowFilters] = useState(false);
    const [classToDelete, setClassToDelete] = useState<Class | null>(null);

    const handleSearch = () => {
        router.get(
            route("admin.classes.index"),
            {
                search: search,
                level: levelFilter,
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
            route("admin.classes.index"),
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
        if (classToDelete) {
            router.delete(route("admin.classes.destroy", classToDelete.id), {
                onSuccess: () => {
                    setClassToDelete(null);
                },
            });
        }
    };

    const clearFilters = () => {
        setSearch("");
        setLevelFilter("");
        router.get(
            route("admin.classes.index"),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const getLevelLabel = (level: number) => {
        const labels: { [key: number]: string } = {
            1: "Kelas 1",
            2: "Kelas 2",
            3: "Kelas 3",
            4: "Kelas 4",
            5: "Kelas 5",
            6: "Kelas 6",
            7: "Kelas 7",
            8: "Kelas 8",
            9: "Kelas 9",
            10: "Kelas 10",
            11: "Kelas 11",
            12: "Kelas 12",
        };
        return labels[level] || `Kelas ${level}`;
    };

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
                                        Manajemen Kelas
                                    </h1>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Kelola data kelas sekolah
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Link
                            href={route("admin.classes.create")}
                            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:scale-105 hover:shadow-lg"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Kelas
                        </Link>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    {...fade}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-3xl font-bold text-primary">
                                {classes.total}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Total Kelas
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Seluruh kelas terdaftar
                        </p>
                    </div>
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="text-3xl font-bold text-green-600">
                                {classes.data.reduce(
                                    (sum, cls) =>
                                        sum + (cls.students_count || 0),
                                    0
                                )}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Total Siswa
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Terdaftar di tahun ajaran aktif
                        </p>
                    </div>
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="text-3xl font-bold text-blue-600">
                                {levels.length}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Tingkatan Kelas
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Dari kelas 1 - 12
                        </p>
                    </div>
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-orange-600" />
                            </div>
                            <span className="text-3xl font-bold text-orange-600">
                                {activeAcademicYear
                                    ? classes.data.filter(
                                          (c) => (c.students_count || 0) > 0
                                      ).length
                                    : 0}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Kelas Terisi
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Memiliki siswa di tahun ini
                        </p>
                    </div>
                </motion.div>

                {/* Active Academic Year Banner */}
                {activeAcademicYear && (
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.4, delay: 0.15 }}
                        className="mb-6 rounded-2xl bg-primary/10 p-4 border border-primary/20"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        Tahun Ajaran Aktif:{" "}
                                        {activeAcademicYear.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Data siswa yang ditampilkan berdasarkan
                                        tahun ajaran aktif
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

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
                                    placeholder="Cari kelas berdasarkan nama atau tingkat..."
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
                                    filters.level ||
                                    filters.sort !== "level"
                                        ? "bg-primary text-white"
                                        : "bg-card text-foreground shadow-soft hover:bg-muted"
                                }`}
                            >
                                <Filter className="h-4 w-4" />
                                Filter
                                {(filters.level ||
                                    filters.sort !== "level") && (
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
                                                Tingkat Kelas
                                            </label>
                                            <select
                                                value={levelFilter}
                                                onChange={(e) => {
                                                    setLevelFilter(
                                                        e.target.value
                                                    );
                                                    handleFilterChange(
                                                        "level",
                                                        e.target.value
                                                    );
                                                }}
                                                className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="">
                                                    Semua Tingkat
                                                </option>
                                                {levels.map((level) => (
                                                    <option
                                                        key={level}
                                                        value={level}
                                                    >
                                                        Kelas {level}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                Urutkan Berdasarkan
                                            </label>
                                            <select
                                                value={filters.sort || "level"}
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        "sort",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="level">
                                                    Tingkat Kelas
                                                </option>
                                                <option value="name">
                                                    Nama Kelas
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
                                                    filters.direction || "asc"
                                                }
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        "direction",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="asc">
                                                    Ascending (A-Z /
                                                    Kecil-Besar)
                                                </option>
                                                <option value="desc">
                                                    Descending (Z-A /
                                                    Besar-Kecil)
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Classes Grid/List */}
                {classes.data.length > 0 ? (
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
                        {classes.data.map((classItem) =>
                            viewMode === "grid" ? (
                                <ClassCardGrid
                                    key={classItem.id}
                                    classItem={classItem}
                                    onDelete={() => setClassToDelete(classItem)}
                                    getLevelLabel={getLevelLabel}
                                />
                            ) : (
                                <ClassCardList
                                    key={classItem.id}
                                    classItem={classItem}
                                    onDelete={() => setClassToDelete(classItem)}
                                    getLevelLabel={getLevelLabel}
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
                            Belum ada data kelas
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Mulai tambahkan data kelas sekolah
                        </p>
                        <Link
                            href={route("admin.classes.create")}
                            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:scale-105 mt-4"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Kelas
                        </Link>
                    </motion.div>
                )}

                {/* Pagination */}
                {classes.last_page > 1 && (
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="mt-8 flex items-center justify-center gap-2"
                    >
                        <Link
                            href={classes.links[0]?.url || "#"}
                            className={`rounded-xl p-2 transition-all ${
                                classes.current_page === 1
                                    ? "cursor-not-allowed opacity-50"
                                    : "hover:bg-muted"
                            }`}
                            preserveScroll
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex gap-1">
                            {Array.from(
                                { length: Math.min(5, classes.last_page) },
                                (_, i) => {
                                    let pageNum;
                                    if (classes.last_page <= 5) {
                                        pageNum = i + 1;
                                    } else if (classes.current_page <= 3) {
                                        pageNum = i + 1;
                                    } else if (
                                        classes.current_page >=
                                        classes.last_page - 2
                                    ) {
                                        pageNum = classes.last_page - 4 + i;
                                    } else {
                                        pageNum = classes.current_page - 2 + i;
                                    }
                                    return (
                                        <Link
                                            key={pageNum}
                                            href={route("admin.classes.index", {
                                                page: pageNum,
                                                ...filters,
                                            })}
                                            className={`rounded-xl px-4 py-2 text-sm transition-all ${
                                                classes.current_page === pageNum
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
                                classes.links[classes.links.length - 1]?.url ||
                                "#"
                            }
                            className={`rounded-xl p-2 transition-all ${
                                classes.current_page === classes.last_page
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
                {classToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        onClick={() => setClassToDelete(null)}
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
                                    Hapus Kelas
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Apakah Anda yakin ingin menghapus kelas "
                                    {classToDelete.name}"?
                                    {classToDelete.enrollments_count &&
                                    classToDelete.enrollments_count > 0 ? (
                                        <span className="block mt-2 text-red-600">
                                            ⚠️ Kelas ini memiliki{" "}
                                            {classToDelete.enrollments_count}{" "}
                                            siswa terdaftar. Tidak dapat
                                            dihapus!
                                        </span>
                                    ) : (
                                        " Tindakan ini tidak dapat dibatalkan."
                                    )}
                                </p>
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => setClassToDelete(null)}
                                        className="flex-1 rounded-xl border-border bg-background px-4 py-2.5 text-sm font-medium transition-all hover:bg-muted"
                                    >
                                        Batal
                                    </button>
                                    {(!classToDelete.enrollments_count ||
                                        classToDelete.enrollments_count ===
                                            0) && (
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
function ClassCardGrid({
    classItem,
    onDelete,
    getLevelLabel,
}: {
    classItem: Class;
    onDelete: () => void;
    getLevelLabel: (level: number) => string;
}) {
    const studentCount = classItem.students_count || 0;
    const colors = [
        "from-primary/20 to-primary/10",
        "from-blue-500/20 to-blue-500/10",
        "from-emerald-500/20 to-emerald-500/10",
        "from-purple-500/20 to-purple-500/10",
        "from-orange-500/20 to-orange-500/10",
        "from-pink-500/20 to-pink-500/10",
    ];
    const colorIndex = classItem.id % colors.length;
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
                        <GraduationCap className="w-16 h-16 text-primary/40" />
                    </div>
                    <div className="absolute top-3 right-3">
                        <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-primary shadow-sm">
                            {getLevelLabel(classItem.level)}
                        </span>
                    </div>
                </div>

                <div className="p-5">
                    <h3 className="font-bold text-lg mb-1">{classItem.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Users className="h-4 w-4" />
                        <span>{studentCount} Siswa</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                            Dibuat:{" "}
                            {new Date(classItem.created_at).toLocaleDateString(
                                "id-ID"
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={route("admin.classes.show", classItem.id)}
                                className="rounded-xl bg-card p-2 text-foreground shadow-soft transition-all hover:bg-muted hover:scale-105"
                                title="Detail Kelas"
                            >
                                <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                                href={route("admin.classes.edit", classItem.id)}
                                className="rounded-xl bg-card p-2 text-foreground shadow-soft transition-all hover:bg-muted hover:scale-105"
                                title="Edit Kelas"
                            >
                                <Edit className="h-4 w-4" />
                            </Link>
                            <button
                                onClick={onDelete}
                                className="rounded-xl bg-card p-2 text-red-600 shadow-soft transition-all hover:bg-red-50 hover:scale-105"
                                title="Hapus Kelas"
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
function ClassCardList({
    classItem,
    onDelete,
    getLevelLabel,
}: {
    classItem: Class;
    onDelete: () => void;
    getLevelLabel: (level: number) => string;
}) {
    const studentCount = classItem.students_count || 0;

    return (
        <motion.div variants={fade} className="group">
            <div className="rounded-3xl bg-card p-5 shadow-soft transition-all hover:shadow-lg">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <GraduationCap className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-bold text-lg">
                                        {classItem.name}
                                    </h3>
                                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                        {getLevelLabel(classItem.level)}
                                    </span>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>{studentCount} Siswa</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            Dibuat:{" "}
                                            {new Date(
                                                classItem.created_at
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
                        <Link
                            href={route("admin.classes.show", classItem.id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2 text-sm shadow-soft transition-all hover:bg-muted"
                        >
                            <Eye className="h-4 w-4" />
                            Detail
                        </Link>
                        <Link
                            href={route("admin.classes.edit", classItem.id)}
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
