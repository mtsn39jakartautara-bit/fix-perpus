import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, router } from "@inertiajs/react";
import {
    Tag,
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
    BookOpen,
    Calendar,
    Layers,
} from "lucide-react";
import { AdminLayout } from "@/Layouts/AppShellAdmin";
import { Category } from "@/types/category";

interface Props {
    categories: {
        data: Category[];
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

export default function CategoriesIndex({ categories, filters }: Props) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [search, setSearch] = useState(filters.search || "");
    const [showFilters, setShowFilters] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
        null
    );

    const handleSearch = () => {
        router.get(
            route("admin.categories.index"),
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
            route("admin.categories.index"),
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
        if (categoryToDelete) {
            router.delete(
                route("admin.categories.destroy", categoryToDelete.id),
                {
                    onSuccess: () => {
                        setCategoryToDelete(null);
                    },
                }
            );
        }
    };

    const clearFilters = () => {
        setSearch("");
        router.get(
            route("admin.categories.index"),
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
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                    <Tag className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                                        Manajemen Kategori
                                    </h1>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Kelola kategori buku perpustakaan
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Link
                            href={route("admin.categories.create")}
                            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:scale-105 hover:shadow-lg"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Kategori
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
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                <Tag className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-3xl font-bold text-purple-600">
                                {categories.total}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Total Kategori
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Seluruh kategori buku
                        </p>
                    </div>
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-3xl font-bold text-blue-600">
                                {categories.data.reduce(
                                    (sum, cat) => sum + (cat.books_count || 0),
                                    0
                                )}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Total Buku
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Buku yang terkategori
                        </p>
                    </div>
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                                <Layers className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-3xl font-bold text-emerald-600">
                                {
                                    categories.data.filter(
                                        (cat) => (cat.books_count || 0) > 0
                                    ).length
                                }
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Kategori Terisi
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Memiliki minimal 1 buku
                        </p>
                    </div>
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-3xl font-bold text-orange-600">
                                {new Date().toLocaleDateString("id-ID", {
                                    month: "short",
                                })}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Bulan Ini
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Update terbaru
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
                                    placeholder="Cari kategori berdasarkan nama..."
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

                {/* Categories Grid/List */}
                {categories.data.length > 0 ? (
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
                        {categories.data.map((category) =>
                            viewMode === "grid" ? (
                                <CategoryCardGrid
                                    key={category.id}
                                    category={category}
                                    onDelete={() =>
                                        setCategoryToDelete(category)
                                    }
                                />
                            ) : (
                                <CategoryCardList
                                    key={category.id}
                                    category={category}
                                    onDelete={() =>
                                        setCategoryToDelete(category)
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
                            <Tag className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">
                            Belum ada kategori
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Mulai tambahkan kategori buku perpustakaan
                        </p>
                        <Link
                            href={route("admin.categories.create")}
                            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:scale-105 mt-4"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Kategori
                        </Link>
                    </motion.div>
                )}

                {/* Pagination */}
                {categories.last_page > 1 && (
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="mt-8 flex items-center justify-center gap-2"
                    >
                        <Link
                            href={categories.links[0]?.url || "#"}
                            className={`rounded-xl p-2 transition-all ${
                                categories.current_page === 1
                                    ? "cursor-not-allowed opacity-50"
                                    : "hover:bg-muted"
                            }`}
                            preserveScroll
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex gap-1">
                            {Array.from(
                                { length: Math.min(5, categories.last_page) },
                                (_, i) => {
                                    let pageNum;
                                    if (categories.last_page <= 5) {
                                        pageNum = i + 1;
                                    } else if (categories.current_page <= 3) {
                                        pageNum = i + 1;
                                    } else if (
                                        categories.current_page >=
                                        categories.last_page - 2
                                    ) {
                                        pageNum = categories.last_page - 4 + i;
                                    } else {
                                        pageNum =
                                            categories.current_page - 2 + i;
                                    }
                                    return (
                                        <Link
                                            key={pageNum}
                                            href={route(
                                                "admin.categories.index",
                                                {
                                                    page: pageNum,
                                                    ...filters,
                                                }
                                            )}
                                            className={`rounded-xl px-4 py-2 text-sm transition-all ${
                                                categories.current_page ===
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
                                categories.links[categories.links.length - 1]
                                    ?.url || "#"
                            }
                            className={`rounded-xl p-2 transition-all ${
                                categories.current_page === categories.last_page
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
                {categoryToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        onClick={() => setCategoryToDelete(null)}
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
                                    Hapus Kategori
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Apakah Anda yakin ingin menghapus kategori "
                                    {categoryToDelete.name}"?
                                    {categoryToDelete.books_count &&
                                    categoryToDelete.books_count > 0 ? (
                                        <span className="block mt-2 text-red-600">
                                            ⚠️ Kategori ini memiliki{" "}
                                            {categoryToDelete.books_count} buku.
                                            Tidak dapat dihapus!
                                        </span>
                                    ) : (
                                        " Tindakan ini tidak dapat dibatalkan."
                                    )}
                                </p>
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() =>
                                            setCategoryToDelete(null)
                                        }
                                        className="flex-1 rounded-xl border-border bg-background px-4 py-2.5 text-sm font-medium transition-all hover:bg-muted"
                                    >
                                        Batal
                                    </button>
                                    {(!categoryToDelete.books_count ||
                                        categoryToDelete.books_count === 0) && (
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
function CategoryCardGrid({
    category,
    onDelete,
}: {
    category: Category;
    onDelete: () => void;
}) {
    const bookCount = category.books_count || 0;
    const colors = [
        "from-purple-500 to-pink-500",
        "from-blue-500 to-cyan-500",
        "from-emerald-500 to-teal-500",
        "from-orange-500 to-red-500",
        "from-indigo-500 to-purple-500",
        "from-pink-500 to-rose-500",
    ];
    const colorIndex = category.id % colors.length;
    const gradientColor = colors[colorIndex];

    return (
        <motion.div variants={fade} className="group">
            <div className="relative overflow-hidden rounded-3xl bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-lg">
                {/* Gradient Header */}
                <div
                    className={`h-32 bg-gradient-to-r ${gradientColor} relative overflow-hidden`}
                >
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/20"></div>
                    <div className="absolute -right-12 -bottom-12 w-32 h-32 rounded-full bg-white/10"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Tag className="w-16 h-16 text-white/80" />
                    </div>
                </div>

                <div className="p-5">
                    <h3 className="font-bold text-lg line-clamp-1 mb-1">
                        {category.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <BookOpen className="h-3 w-3" />
                        <span>{bookCount} Buku</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                            Slug: {category.slug}
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={route(
                                    "admin.categories.edit",
                                    category.id
                                )}
                                className="rounded-xl bg-card p-2 text-foreground shadow-soft transition-all hover:bg-muted hover:scale-105"
                                title="Edit Kategori"
                            >
                                <Edit className="h-4 w-4" />
                            </Link>
                            <button
                                onClick={onDelete}
                                className="rounded-xl bg-card p-2 text-red-600 shadow-soft transition-all hover:bg-red-50 hover:scale-105"
                                title="Hapus Kategori"
                                disabled={bookCount > 0}
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
function CategoryCardList({
    category,
    onDelete,
}: {
    category: Category;
    onDelete: () => void;
}) {
    const bookCount = category.books_count || 0;
    const colors = [
        "from-purple-500 to-pink-500",
        "from-blue-500 to-cyan-500",
        "from-emerald-500 to-teal-500",
        "from-orange-500 to-red-500",
        "from-indigo-500 to-purple-500",
        "from-pink-500 to-rose-500",
    ];
    const colorIndex = category.id % colors.length;
    const gradientColor = colors[colorIndex];

    return (
        <motion.div variants={fade} className="group">
            <div className="rounded-3xl bg-card shadow-soft transition-all hover:shadow-lg">
                <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                        <div className="flex items-start gap-4">
                            <div
                                className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${gradientColor} flex items-center justify-center flex-shrink-0`}
                            >
                                <Tag className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">
                                    {category.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Slug: {category.slug}
                                </p>
                                <div className="mt-2 flex items-center gap-3 text-sm">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <BookOpen className="h-3 w-3" />
                                        <span>{bookCount} Buku</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                            Dibuat:{" "}
                                            {new Date(
                                                category.created_at
                                            ).toLocaleDateString("id-ID")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Link
                                href={route(
                                    "admin.categories.edit",
                                    category.id
                                )}
                                className="inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2 text-sm shadow-soft transition-all hover:bg-muted"
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </Link>
                            <button
                                onClick={onDelete}
                                className="inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2 text-sm text-red-600 shadow-soft transition-all hover:bg-red-50"
                                disabled={bookCount > 0}
                            >
                                <Trash2 className="h-4 w-4" />
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
