import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/Layouts/AppShell";
import { Link, router } from "@inertiajs/react";
import {
    BookOpen,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
    X,
    Download,
    Calendar,
    User,
    Building,
    BookMarked,
    Grid3x3,
    List,
    Upload,
    FileText,
    Sparkles,
} from "lucide-react";
import { AdminLayout } from "@/Layouts/AppShellAdmin";

interface Book {
    id: number | string | any;
    uuid: string;
    title: string;
    author: string | null;
    publisher: string | null;
    publish_year: number | null;
    abstract: string | null;
    pdf_file: string | null;
    created_at: string;
    categories: Category[];
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    books: {
        data: Book[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: any[];
    };
    categories: Category[];
    filters: {
        search: string;
        category: string;
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

export default function DigitalBooksIndex({
    books,
    categories,
    filters,
}: Props) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [search, setSearch] = useState(filters.search || "");
    const [selectedCategory, setSelectedCategory] = useState(
        filters.category || ""
    );
    const [showFilters, setShowFilters] = useState(false);
    const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

    const handleSearch = () => {
        router.get(
            route("admin.books.digital.index"),
            {
                search: search,
                category: selectedCategory,
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
            route("admin.books.digital.index"),
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
        if (bookToDelete) {
            router.delete(
                route("admin.books.digital.destroy", bookToDelete.id),
                {
                    onSuccess: () => {
                        setBookToDelete(null);
                    },
                }
            );
        }
    };

    const clearFilters = () => {
        setSearch("");
        setSelectedCategory("");
        router.get(
            route("admin.books.digital.index"),
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
                                <div className="w-10 h-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                                        Manajemen Buku Digital
                                    </h1>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Kelola koleksi buku digital perpustakaan
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Link
                            href={route("admin.books.digital.create")}
                            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:scale-105 hover:shadow-lg"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Buku Digital
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
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-3xl font-bold text-blue-600">
                                {books.total}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Total Buku
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Koleksi buku digital
                        </p>
                    </div>
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                <BookMarked className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-3xl font-bold text-purple-600">
                                {categories.length}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Total Kategori
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Kategori buku tersedia
                        </p>
                    </div>
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                                <Upload className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-3xl font-bold text-emerald-600">
                                {books.data.filter((b) => b.pdf_file).length}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Dengan File PDF
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Buku yang sudah diupload
                        </p>
                    </div>
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-3xl font-bold text-orange-600">
                                {
                                    books.data.filter(
                                        (b) => b.categories.length > 0
                                    ).length
                                }
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-3">
                            Dengan Kategori
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Buku yang sudah dikategorikan
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
                                    placeholder="Cari buku berdasarkan judul, penulis, atau penerbit..."
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
                                    filters.sort !== "created_at"
                                        ? "bg-primary text-white"
                                        : "bg-card text-foreground shadow-soft hover:bg-muted"
                                }`}
                            >
                                <Filter className="h-4 w-4" />
                                Filter
                                {(filters.category ||
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
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">
                                                Kategori
                                            </label>
                                            <select
                                                value={selectedCategory}
                                                onChange={(e) => {
                                                    setSelectedCategory(
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
                                                {categories.map((category) => (
                                                    <option
                                                        key={category.id}
                                                        value={category.id}
                                                    >
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
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
                                                <option value="title">
                                                    Judul (A-Z)
                                                </option>
                                                <option value="author">
                                                    Penulis (A-Z)
                                                </option>
                                                <option value="publish_year">
                                                    Tahun Terbit
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Books Grid/List */}
                {books.data.length > 0 ? (
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
                        {books.data.map((book) =>
                            viewMode === "grid" ? (
                                <BookCardGrid
                                    key={book.id}
                                    book={book}
                                    onDelete={() => setBookToDelete(book)}
                                />
                            ) : (
                                <BookCardList
                                    key={book.id}
                                    book={book}
                                    onDelete={() => setBookToDelete(book)}
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
                            <BookOpen className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">
                            Belum ada buku digital
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Mulai tambahkan koleksi buku digital perpustakaan
                        </p>
                        <Link
                            href={route("admin.books.digital.create")}
                            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:scale-105 mt-4"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Buku Digital
                        </Link>
                    </motion.div>
                )}

                {/* Pagination */}
                {books.last_page > 1 && (
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="mt-8 flex items-center justify-center gap-2"
                    >
                        <Link
                            href={books.links[0]?.url || "#"}
                            className={`rounded-xl p-2 transition-all ${
                                books.current_page === 1
                                    ? "cursor-not-allowed opacity-50"
                                    : "hover:bg-muted"
                            }`}
                            preserveScroll
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex gap-1">
                            {Array.from(
                                { length: Math.min(5, books.last_page) },
                                (_, i) => {
                                    let pageNum;
                                    if (books.last_page <= 5) {
                                        pageNum = i + 1;
                                    } else if (books.current_page <= 3) {
                                        pageNum = i + 1;
                                    } else if (
                                        books.current_page >=
                                        books.last_page - 2
                                    ) {
                                        pageNum = books.last_page - 4 + i;
                                    } else {
                                        pageNum = books.current_page - 2 + i;
                                    }
                                    return (
                                        <Link
                                            key={pageNum}
                                            href={route(
                                                "admin.books.digital.index",
                                                {
                                                    page: pageNum,
                                                    ...filters,
                                                }
                                            )}
                                            className={`rounded-xl px-4 py-2 text-sm transition-all ${
                                                books.current_page === pageNum
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
                                books.links[books.links.length - 1]?.url || "#"
                            }
                            className={`rounded-xl p-2 transition-all ${
                                books.current_page === books.last_page
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
                {bookToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        onClick={() => setBookToDelete(null)}
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
                                    Hapus Buku
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Apakah Anda yakin ingin menghapus buku "
                                    {bookToDelete.title}"? Tindakan ini tidak
                                    dapat dibatalkan.
                                </p>
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => setBookToDelete(null)}
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
function BookCardGrid({
    book,
    onDelete,
}: {
    book: Book;
    onDelete: () => void;
}) {
    return (
        <motion.div variants={fade} className="group">
            <div className="relative overflow-hidden rounded-3xl bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-lg">
                {/* Book Cover Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    {book.pdf_file ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                            <FileText className="h-16 w-16 text-primary/40" />
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <BookOpen className="h-16 w-16 text-muted-foreground/30" />
                        </div>
                    )}
                    {/* Action Buttons Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <Link
                            href={route("admin.books.digital.edit", book.id)}
                            className="rounded-xl bg-white p-2 text-gray-900 transition-all hover:scale-110"
                        >
                            <Edit className="h-4 w-4" />
                        </Link>
                        <button
                            onClick={onDelete}
                            className="rounded-xl bg-white p-2 text-red-600 transition-all hover:scale-110"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="p-5">
                    <h3 className="font-bold line-clamp-1">{book.title}</h3>
                    {book.author && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span className="line-clamp-1">{book.author}</span>
                        </div>
                    )}
                    {book.publisher && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Building className="h-3 w-3" />
                            <span className="line-clamp-1">
                                {book.publisher}
                            </span>
                        </div>
                    )}
                    {book.publish_year && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{book.publish_year}</span>
                        </div>
                    )}
                    {book.categories.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                            {book.categories.slice(0, 2).map((cat) => (
                                <span
                                    key={cat.id}
                                    className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                                >
                                    {cat.name}
                                </span>
                            ))}
                            {book.categories.length > 2 && (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                    +{book.categories.length - 2}
                                </span>
                            )}
                        </div>
                    )}
                    {book.abstract && (
                        <p className="mt-3 text-xs text-muted-foreground line-clamp-2">
                            {book.abstract}
                        </p>
                    )}
                    {book.pdf_file && (
                        <a
                            href={`/storage/${book.pdf_file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                            <Download className="h-3 w-3" />
                            Download PDF
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// List Card Component
function BookCardList({
    book,
    onDelete,
}: {
    book: Book;
    onDelete: () => void;
}) {
    return (
        <motion.div variants={fade} className="group">
            <div className="rounded-3xl bg-card p-5 shadow-soft transition-all hover:shadow-lg">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                        <div className="flex items-start gap-4">
                            <div className="hidden h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 lg:flex">
                                {book.pdf_file ? (
                                    <FileText className="h-8 w-8 text-primary/40" />
                                ) : (
                                    <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold">{book.title}</h3>
                                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                    {book.author && (
                                        <div className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            <span>{book.author}</span>
                                        </div>
                                    )}
                                    {book.publisher && (
                                        <div className="flex items-center gap-1">
                                            <Building className="h-3 w-3" />
                                            <span>{book.publisher}</span>
                                        </div>
                                    )}
                                    {book.publish_year && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>{book.publish_year}</span>
                                        </div>
                                    )}
                                </div>
                                {book.categories.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {book.categories.map((cat) => (
                                            <span
                                                key={cat.id}
                                                className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                                            >
                                                {cat.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {book.abstract && (
                                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                                        {book.abstract}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {book.pdf_file && (
                            <a
                                href={`/storage/${book.pdf_file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm text-primary transition-all hover:bg-primary/20"
                            >
                                <Download className="h-4 w-4" />
                                PDF
                            </a>
                        )}
                        <Link
                            href={route("admin.books.digital.edit", book.id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2 text-sm shadow-soft transition-all hover:bg-muted"
                        >
                            <Edit className="h-4 w-4" />
                            Edit
                        </Link>
                        <button
                            onClick={onDelete}
                            className="inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2 text-sm text-red-600 shadow-soft transition-all hover:bg-red-50"
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
