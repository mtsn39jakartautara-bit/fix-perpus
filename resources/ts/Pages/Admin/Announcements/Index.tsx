import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, router } from "@inertiajs/react";
import {
    Megaphone,
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
    Calendar,
    Tag,
    CheckCircle,
    XCircle,
    EyeOff,
    CalendarRange,
} from "lucide-react";
import { AdminLayout } from "@/Layouts/AppShellAdmin";
import { Announcement } from "@/types/announcement";

interface Props {
    announcements: {
        data: Announcement[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: any[];
    };
    filters: {
        search: string;
        category: string;
        status: string;
        date_from: string;
        date_to: string;
        sort: string;
        direction: string;
    };
    categories: string[];
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

const categoryColors: { [key: string]: string } = {
    umum: "from-blue-500/20 to-blue-500/10",
    akademik: "from-emerald-500/20 to-emerald-500/10",
    perpustakaan: "from-purple-500/20 to-purple-500/10",
    event: "from-orange-500/20 to-orange-500/10",
    pengumuman: "from-primary/20 to-primary/10",
};

export default function AnnouncementsIndex({
    announcements,
    filters,
    categories,
}: Props) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [search, setSearch] = useState(filters.search || "");
    const [categoryFilter, setCategoryFilter] = useState(
        filters.category || ""
    );
    const [statusFilter, setStatusFilter] = useState(filters.status || "");
    const [dateFrom, setDateFrom] = useState(filters.date_from || "");
    const [dateTo, setDateTo] = useState(filters.date_to || "");
    const [showFilters, setShowFilters] = useState(false);
    const [announcementToDelete, setAnnouncementToDelete] =
        useState<Announcement | null>(null);
    const [viewingAnnouncement, setViewingAnnouncement] =
        useState<Announcement | null>(null);

    const handleSearch = () => {
        router.get(
            route("admin.announcements.index"),
            {
                search: search,
                category: categoryFilter,
                status: statusFilter,
                date_from: dateFrom,
                date_to: dateTo,
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
            route("admin.announcements.index"),
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
        if (announcementToDelete) {
            router.delete(
                route("admin.announcements.destroy", announcementToDelete.id),
                {
                    onSuccess: () => {
                        setAnnouncementToDelete(null);
                    },
                }
            );
        }
    };

    const handleToggleStatus = (announcement: Announcement) => {
        router.post(
            route("admin.announcements.toggle-status", announcement.id),
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const clearFilters = () => {
        setSearch("");
        setCategoryFilter("");
        setStatusFilter("");
        setDateFrom("");
        setDateTo("");
        router.get(
            route("admin.announcements.index"),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const activeCount = announcements.data.filter((a) => a.is_active).length;
    const upcomingCount = announcements.data.filter(
        (a) => new Date(a.date) >= new Date()
    ).length;

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
                                    <Megaphone className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                                        Manajemen Pengumuman
                                    </h1>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Kelola pengumuman untuk pengguna
                                        perpustakaan
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Link
                            href={route("admin.announcements.create")}
                            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:scale-105 hover:shadow-lg"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Pengumuman
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
                                <Megaphone className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-3xl font-bold text-primary">
                                {announcements.total}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Total Pengumuman
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Seluruh pengumuman terdaftar
                        </p>
                    </div>
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="text-3xl font-bold text-green-600">
                                {activeCount}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Pengumuman Aktif
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Sedang ditampilkan
                        </p>
                    </div>
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                                <CalendarRange className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="text-3xl font-bold text-blue-600">
                                {upcomingCount}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Akan Datang
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Jadwal mendatang
                        </p>
                    </div>
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                                <Tag className="w-6 h-6 text-orange-600" />
                            </div>
                            <span className="text-3xl font-bold text-orange-600">
                                {categories.length}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Kategori
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Jenis pengumuman
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
                                    placeholder="Cari pengumuman berdasarkan judul, deskripsi, atau kategori..."
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
                                    filters.category ||
                                    filters.status ||
                                    filters.date_from ||
                                    filters.date_to ||
                                    filters.sort !== "date"
                                        ? "bg-primary text-white"
                                        : "bg-card text-foreground shadow-soft hover:bg-muted"
                                }`}
                            >
                                <Filter className="h-4 w-4" />
                                Filter
                                {(filters.category ||
                                    filters.status ||
                                    filters.date_from ||
                                    filters.date_to ||
                                    filters.sort !== "date") && (
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
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                Kategori
                                            </label>
                                            <select
                                                value={categoryFilter}
                                                onChange={(e) => {
                                                    setCategoryFilter(
                                                        e.target.value
                                                    );
                                                    handleFilterChange(
                                                        "category",
                                                        e.target.value
                                                    );
                                                }}
                                                className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="">
                                                    Semua Kategori
                                                </option>
                                                {categories.map((cat) => (
                                                    <option
                                                        key={cat}
                                                        value={cat}
                                                    >
                                                        {cat
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            cat.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
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
                                                Dari Tanggal
                                            </label>
                                            <input
                                                type="date"
                                                value={dateFrom}
                                                onChange={(e) => {
                                                    setDateFrom(e.target.value);
                                                    handleFilterChange(
                                                        "date_from",
                                                        e.target.value
                                                    );
                                                }}
                                                className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                Sampai Tanggal
                                            </label>
                                            <input
                                                type="date"
                                                value={dateTo}
                                                onChange={(e) => {
                                                    setDateTo(e.target.value);
                                                    handleFilterChange(
                                                        "date_to",
                                                        e.target.value
                                                    );
                                                }}
                                                className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                Urutkan Berdasarkan
                                            </label>
                                            <select
                                                value={filters.sort || "date"}
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        "sort",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="date">
                                                    Tanggal
                                                </option>
                                                <option value="title">
                                                    Judul
                                                </option>
                                                <option value="category">
                                                    Kategori
                                                </option>
                                                <option value="created_at">
                                                    Terbaru
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

                {/* Announcements Grid/List */}
                {announcements.data.length > 0 ? (
                    <motion.div
                        variants={stagger}
                        initial="initial"
                        animate="animate"
                        className={
                            viewMode === "grid"
                                ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                                : "space-y-4"
                        }
                    >
                        {announcements.data.map((announcement) =>
                            viewMode === "grid" ? (
                                <AnnouncementCardGrid
                                    key={announcement.id}
                                    announcement={announcement}
                                    onDelete={() =>
                                        setAnnouncementToDelete(announcement)
                                    }
                                    onToggleStatus={() =>
                                        handleToggleStatus(announcement)
                                    }
                                    onView={() =>
                                        setViewingAnnouncement(announcement)
                                    }
                                />
                            ) : (
                                <AnnouncementCardList
                                    key={announcement.id}
                                    announcement={announcement}
                                    onDelete={() =>
                                        setAnnouncementToDelete(announcement)
                                    }
                                    onToggleStatus={() =>
                                        handleToggleStatus(announcement)
                                    }
                                    onView={() =>
                                        setViewingAnnouncement(announcement)
                                    }
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
                            <Megaphone className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">
                            Belum ada pengumuman
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Mulai tambahkan pengumuman untuk pengguna
                            perpustakaan
                        </p>
                        <Link
                            href={route("admin.announcements.create")}
                            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:scale-105 mt-4"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Pengumuman
                        </Link>
                    </motion.div>
                )}

                {/* Pagination */}
                {announcements.last_page > 1 && (
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="mt-8 flex items-center justify-center gap-2"
                    >
                        <Link
                            href={announcements.links[0]?.url || "#"}
                            className={`rounded-xl p-2 transition-all ${
                                announcements.current_page === 1
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
                                        announcements.last_page
                                    ),
                                },
                                (_, i) => {
                                    let pageNum;
                                    if (announcements.last_page <= 5) {
                                        pageNum = i + 1;
                                    } else if (
                                        announcements.current_page <= 3
                                    ) {
                                        pageNum = i + 1;
                                    } else if (
                                        announcements.current_page >=
                                        announcements.last_page - 2
                                    ) {
                                        pageNum =
                                            announcements.last_page - 4 + i;
                                    } else {
                                        pageNum =
                                            announcements.current_page - 2 + i;
                                    }
                                    return (
                                        <Link
                                            key={pageNum}
                                            href={route(
                                                "admin.announcements.index",
                                                {
                                                    page: pageNum,
                                                    ...filters,
                                                }
                                            )}
                                            className={`rounded-xl px-4 py-2 text-sm transition-all ${
                                                announcements.current_page ===
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
                                announcements.links[
                                    announcements.links.length - 1
                                ]?.url || "#"
                            }
                            className={`rounded-xl p-2 transition-all ${
                                announcements.current_page ===
                                announcements.last_page
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

            {/* View Detail Modal */}
            <AnimatePresence>
                {viewingAnnouncement && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setViewingAnnouncement(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card shadow-float"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-6 py-4">
                                <h3 className="text-xl font-semibold">
                                    Detail Pengumuman
                                </h3>
                                <button
                                    onClick={() => setViewingAnnouncement(null)}
                                    className="rounded-lg p-1 hover:bg-muted transition-colors"
                                >
                                    <XCircle className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                                            viewingAnnouncement.is_active
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-600"
                                        }`}
                                    >
                                        {viewingAnnouncement.is_active
                                            ? "Aktif"
                                            : "Tidak Aktif"}
                                    </span>
                                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                        {viewingAnnouncement.category}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold mb-3">
                                    {viewingAnnouncement.title}
                                </h2>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {new Date(
                                            viewingAnnouncement.date
                                        ).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                                <div className="prose prose-sm max-w-none">
                                    <p className="whitespace-pre-wrap">
                                        {viewingAnnouncement.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {announcementToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        onClick={() => setAnnouncementToDelete(null)}
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
                                    Hapus Pengumuman
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Apakah Anda yakin ingin menghapus pengumuman
                                    "{announcementToDelete.title}"? Tindakan ini
                                    tidak dapat dibatalkan.
                                </p>
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() =>
                                            setAnnouncementToDelete(null)
                                        }
                                        className="flex-1 rounded-xl border-border bg-background px-4 py-2.5 text-sm font-medium transition-all hover:bg-muted"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-700"
                                    >
                                        Hapus
                                    </button>
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
function AnnouncementCardGrid({
    announcement,
    onDelete,
    onToggleStatus,
    onView,
}: {
    announcement: Announcement;
    onDelete: () => void;
    onToggleStatus: () => void;
    onView: () => void;
}) {
    const categoryKey = announcement.category.toLowerCase();
    const bgGradient = categoryColors[categoryKey] || categoryColors.pengumuman;
    const isPast = new Date(announcement.date) < new Date();

    return (
        <motion.div variants={fade} className="group">
            <div className="relative overflow-hidden rounded-3xl bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-lg">
                {/* Gradient Header */}
                <div
                    className={`h-24 bg-gradient-to-r ${bgGradient} relative overflow-hidden`}
                >
                    <div className="absolute inset-0 bg-black/5"></div>
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/20"></div>
                    <div className="absolute -right-12 -bottom-12 w-32 h-32 rounded-full bg-white/10"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Megaphone className="w-12 h-12 text-primary/40" />
                    </div>
                    <div className="absolute top-3 right-3 flex gap-1">
                        {announcement.is_active && (
                            <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
                                Aktif
                            </span>
                        )}
                        {isPast && (
                            <span className="rounded-full bg-gray-500 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
                                Lewat
                            </span>
                        )}
                    </div>
                </div>

                <div className="p-5">
                    <div className="mb-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            <Tag className="h-3 w-3" />
                            {announcement.category}
                        </span>
                    </div>
                    <h3 className="font-bold text-lg line-clamp-1 mb-2">
                        {announcement.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {announcement.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                        <Calendar className="h-3 w-3" />
                        <span>
                            {new Date(announcement.date).toLocaleDateString(
                                "id-ID"
                            )}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <button
                            onClick={onView}
                            className="inline-flex items-center gap-1 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/20"
                        >
                            <Eye className="h-3 w-3" />
                            Detail
                        </button>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={onToggleStatus}
                                className="rounded-xl bg-card p-1.5 text-foreground shadow-soft transition-all hover:bg-muted"
                                title={
                                    announcement.is_active
                                        ? "Nonaktifkan"
                                        : "Aktifkan"
                                }
                            >
                                {announcement.is_active ? (
                                    <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                    <CheckCircle className="h-3.5 w-3.5" />
                                )}
                            </button>
                            <Link
                                href={route(
                                    "admin.announcements.edit",
                                    announcement.id
                                )}
                                className="rounded-xl bg-card p-1.5 text-foreground shadow-soft transition-all hover:bg-muted"
                            >
                                <Edit className="h-3.5 w-3.5" />
                            </Link>
                            <button
                                onClick={onDelete}
                                className="rounded-xl bg-card p-1.5 text-red-600 shadow-soft transition-all hover:bg-red-50"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// List Card Component
function AnnouncementCardList({
    announcement,
    onDelete,
    onToggleStatus,
    onView,
}: {
    announcement: Announcement;
    onDelete: () => void;
    onToggleStatus: () => void;
    onView: () => void;
}) {
    const isPast = new Date(announcement.date) < new Date();

    return (
        <motion.div variants={fade} className="group">
            <div className="rounded-3xl bg-card p-5 shadow-soft transition-all hover:shadow-lg">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Megaphone className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h3 className="font-bold">
                                        {announcement.title}
                                    </h3>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                        <Tag className="h-3 w-3" />
                                        {announcement.category}
                                    </span>
                                    {announcement.is_active ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                            <CheckCircle className="h-3 w-3" />
                                            Aktif
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                            <XCircle className="h-3 w-3" />
                                            Tidak Aktif
                                        </span>
                                    )}
                                    {isPast && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                            <Calendar className="h-3 w-3" />
                                            Lewat
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                    {announcement.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                        {new Date(
                                            announcement.date
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
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onView}
                            className="inline-flex items-center gap-1 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/20"
                        >
                            <Eye className="h-3 w-3" />
                            Detail
                        </button>
                        <button
                            onClick={onToggleStatus}
                            className="inline-flex items-center gap-1 rounded-xl bg-card px-3 py-1.5 text-xs font-medium shadow-soft transition-all hover:bg-muted"
                        >
                            {announcement.is_active ? (
                                <>
                                    <EyeOff className="h-3 w-3" />
                                    Nonaktifkan
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-3 w-3" />
                                    Aktifkan
                                </>
                            )}
                        </button>
                        <Link
                            href={route(
                                "admin.announcements.edit",
                                announcement.id
                            )}
                            className="inline-flex items-center gap-1 rounded-xl bg-card px-3 py-1.5 text-xs font-medium shadow-soft transition-all hover:bg-muted"
                        >
                            <Edit className="h-3 w-3" />
                            Edit
                        </Link>
                        <button
                            onClick={onDelete}
                            className="inline-flex items-center gap-1 rounded-xl bg-card px-3 py-1.5 text-xs font-medium text-red-600 shadow-soft transition-all hover:bg-red-50"
                        >
                            <Trash2 className="h-3 w-3" />
                            Hapus
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
