import { useState } from "react";
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
    UserIcon,
    Mail,
    Clock,
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

export default function External({ users, filters }: Props) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [search, setSearch] = useState(filters.search || "");
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = () => {
        router.get(
            route("admin.users.external"),
            {
                search: search,
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
            route("admin.users.external"),
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
        router.get(
            route("admin.users.external"),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
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
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                                        Manajemen Pengguna Eksternal
                                    </h1>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Kelola data pengguna dari luar sekolah
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    {...fade}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
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
                            Total Pengguna
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Seluruh pengguna eksternal
                        </p>
                    </div>
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                                <Mail className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="text-3xl font-bold text-green-600">
                                {users.data.length}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Email Terdaftar
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Semua memiliki email
                        </p>
                    </div>
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                            <span className="text-3xl font-bold text-orange-600">
                                {users.data.reduce(
                                    (sum, u) => sum + (u.total_points || 0),
                                    0
                                )}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Total Poin
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Akumulasi poin pengguna
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
                                    placeholder="Cari pengguna berdasarkan nama atau email..."
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
                                    showFilters || filters.sort !== "created_at"
                                        ? "bg-primary text-white"
                                        : "bg-card text-foreground shadow-soft hover:bg-muted"
                                }`}
                            >
                                <Filter className="h-4 w-4" />
                                Filter
                                {filters.sort !== "created_at" && (
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
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                Urutkan Berdasarkan
                                            </label>
                                            <select
                                                value={
                                                    filters.sort || "created_at"
                                                }
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
                                                    Descending (Z-A)
                                                </option>
                                                <option value="asc">
                                                    Ascending (A-Z)
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
                                <ExternalCardGrid key={user.id} user={user} />
                            ) : (
                                <ExternalCardList key={user.id} user={user} />
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
                            <Users className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">
                            Belum ada pengguna eksternal
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Belum ada pengguna dari luar sekolah yang terdaftar
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
                                                "admin.users.external",
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

// Grid Card Component for External
function ExternalCardGrid({ user }: { user: User }) {
    return (
        <motion.div variants={fade} className="group">
            <div className="relative overflow-hidden rounded-3xl bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-bold line-clamp-1">{user.name}</h3>
                        <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="line-clamp-1">
                                    {user.email}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                    Bergabung:{" "}
                                    {new Date(
                                        user.created_at
                                    ).toLocaleDateString("id-ID")}
                                </span>
                            </div>
                        </div>
                    </div>

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
                            href={route("admin.users.show.external", user.id)}
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

// List Card Component for External
function ExternalCardList({ user }: { user: User }) {
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
                                <h3 className="font-bold">{user.name}</h3>
                                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        <span>{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                            Bergabung:{" "}
                                            {new Date(
                                                user.created_at
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
                            href={route("admin.users.show.external", user.id)}
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
