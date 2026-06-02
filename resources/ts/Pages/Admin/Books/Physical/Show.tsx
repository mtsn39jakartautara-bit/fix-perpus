import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/Layouts/AppShell";
import { Link, router } from "@inertiajs/react";
import {
    ArrowLeft,
    BookOpen,
    Edit,
    Trash2,
    Plus,
    Package,
    MapPin,
    Calendar,
    User,
    Building,
    Barcode,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { AdminLayout } from "@/Layouts/AppShellAdmin";

interface BookItem {
    id: number | string | any;
    barcode: string;
    status: "available" | "borrowed" | "lost" | "damaged";
    created_at: string;
    current_borrowing?: {
        user: {
            name: string;
        };
        borrowed_at: string;
        due_date: string;
    };
}

interface PhysicalBook {
    id: number | string | any;
    title: string;
    isbn: string | null;
    author: string | null;
    publisher: string | null;
    location_rack: string | null;
    publish_year: number | null;
    abstract: string | null;
    cover_image: string | null;
    stock: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    book: PhysicalBook;
    items: {
        data: BookItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: any[];
    };
    stats: {
        total: number;
        available: number;
        borrowed: number;
        lost: number;
        damaged: number;
    };
}

const fade = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
};

export default function PhysicalBookShow({ book, items, stats }: Props) {
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [itemToDelete, setItemToDelete] = useState<BookItem | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAddItem = () => {
        setLoading(true);
        router.post(
            route("admin.books.physical.add-item", book.id),
            { quantity },
            {
                onSuccess: () => {
                    setShowAddItemModal(false);
                    setQuantity(1);
                    setLoading(false);
                },
                onError: () => {
                    setLoading(false);
                },
            }
        );
    };

    const handleDeleteItem = () => {
        if (itemToDelete) {
            router.delete(
                route("admin.books.physical.delete-item", itemToDelete.id),
                {
                    onSuccess: () => {
                        setItemToDelete(null);
                    },
                }
            );
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "available":
                return {
                    label: "Tersedia",
                    color: "text-green-600",
                    bg: "bg-green-100",
                    icon: CheckCircle,
                };
            case "borrowed":
                return {
                    label: "Dipinjam",
                    color: "text-blue-600",
                    bg: "bg-blue-100",
                    icon: Clock,
                };
            case "lost":
                return {
                    label: "Hilang",
                    color: "text-red-600",
                    bg: "bg-red-100",
                    icon: XCircle,
                };
            case "damaged":
                return {
                    label: "Rusak",
                    color: "text-yellow-600",
                    bg: "bg-yellow-100",
                    icon: AlertCircle,
                };
            default:
                return {
                    label: status,
                    color: "text-gray-600",
                    bg: "bg-gray-100",
                    icon: AlertCircle,
                };
        }
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
                    <Link
                        href={route("admin.books.physical.index")}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Daftar Buku
                    </Link>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                                <BookOpen className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                                    {book.title}
                                </h1>
                                <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                                    {book.author && (
                                        <div className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            <span>{book.author}</span>
                                        </div>
                                    )}
                                    {book.publisher && (
                                        <div className="flex items-center gap-1">
                                            <Building className="h-4 w-4" />
                                            <span>{book.publisher}</span>
                                        </div>
                                    )}
                                    {book.publish_year && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>{book.publish_year}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link
                                href={route(
                                    "admin.books.physical.edit",
                                    book.id
                                )}
                                className="inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2.5 text-sm shadow-soft transition-all hover:bg-muted"
                            >
                                <Edit className="h-4 w-4" />
                                Edit Buku
                            </Link>
                            <button
                                onClick={() => setShowAddItemModal(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:scale-105"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Eksemplar
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Book Details */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Book Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Cover Image */}
                        <motion.div
                            {...fade}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="rounded-3xl bg-card overflow-hidden shadow-soft"
                        >
                            {book.cover_image ? (
                                <img
                                    src={`/storage/${book.cover_image}`}
                                    alt={book.title}
                                    className="w-full object-cover"
                                />
                            ) : (
                                <div className="aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500/10 to-teal-500/5">
                                    <BookOpen className="h-20 w-20 text-muted-foreground/30" />
                                    <p className="mt-4 text-sm text-muted-foreground">
                                        Tidak ada cover
                                    </p>
                                </div>
                            )}
                        </motion.div>

                        {/* Book Information */}
                        <motion.div
                            {...fade}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="rounded-3xl bg-card p-6 shadow-soft"
                        >
                            <h3 className="mb-4 font-semibold">
                                Informasi Buku
                            </h3>
                            <div className="space-y-3">
                                {book.isbn && (
                                    <div>
                                        <label className="text-xs text-muted-foreground">
                                            ISBN
                                        </label>
                                        <p className="text-sm font-medium">
                                            {book.isbn}
                                        </p>
                                    </div>
                                )}
                                {book.location_rack && (
                                    <div>
                                        <label className="text-xs text-muted-foreground">
                                            Lokasi Rak
                                        </label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm font-medium">
                                                {book.location_rack}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {book.abstract && (
                                    <div>
                                        <label className="text-xs text-muted-foreground">
                                            Sinopsis
                                        </label>
                                        <p className="mt-1 text-sm leading-relaxed">
                                            {book.abstract}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Stats & Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats Cards */}
                        <motion.div
                            {...fade}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
                        >
                            <div className="rounded-2xl bg-card p-4 shadow-soft text-center">
                                <Package className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold">
                                    {stats.total}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Total
                                </p>
                            </div>
                            <div className="rounded-2xl bg-card p-4 shadow-soft text-center">
                                <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold">
                                    {stats.available}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Tersedia
                                </p>
                            </div>
                            <div className="rounded-2xl bg-card p-4 shadow-soft text-center">
                                <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold">
                                    {stats.borrowed}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Dipinjam
                                </p>
                            </div>
                            <div className="rounded-2xl bg-card p-4 shadow-soft text-center">
                                <AlertCircle className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold">
                                    {stats.lost + stats.damaged}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Bermasalah
                                </p>
                            </div>
                        </motion.div>

                        {/* Items List */}
                        <motion.div
                            {...fade}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="rounded-3xl bg-card p-6 shadow-soft"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">
                                    Daftar Eksemplar Buku
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Total {items.total} item
                                </p>
                            </div>

                            <div className="space-y-3">
                                {items.data.length > 0 ? (
                                    items.data.map((item) => {
                                        const status = getStatusBadge(
                                            item.status
                                        );
                                        const StatusIcon = status.icon;
                                        return (
                                            <div
                                                key={item.id}
                                                className="rounded-xl border-border bg-background p-4 transition-all hover:shadow-md"
                                            >
                                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <Barcode className="h-5 w-5 text-muted-foreground" />
                                                            <div>
                                                                <p className="font-mono text-sm font-medium">
                                                                    {
                                                                        item.barcode
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Ditambahkan:{" "}
                                                                    {new Date(
                                                                        item.created_at
                                                                    ).toLocaleDateString(
                                                                        "id-ID"
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {item.status ===
                                                            "borrowed" &&
                                                            item.current_borrowing && (
                                                                <div className="mt-2 ml-8 text-xs text-muted-foreground">
                                                                    <p>
                                                                        Dipinjam
                                                                        oleh:{" "}
                                                                        {
                                                                            item
                                                                                .current_borrowing
                                                                                .user
                                                                                .name
                                                                        }
                                                                    </p>
                                                                    <p>
                                                                        Jatuh
                                                                        tempo:{" "}
                                                                        {new Date(
                                                                            item.current_borrowing.due_date
                                                                        ).toLocaleDateString(
                                                                            "id-ID"
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`inline-flex items-center gap-1 rounded-full ${status.bg} px-3 py-1 text-xs font-medium ${status.color}`}
                                                        >
                                                            <StatusIcon className="h-3 w-3" />
                                                            {status.label}
                                                        </div>
                                                        {item.status !==
                                                            "borrowed" && (
                                                            <button
                                                                onClick={() =>
                                                                    setItemToDelete(
                                                                        item
                                                                    )
                                                                }
                                                                className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-8 text-center">
                                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-sm text-muted-foreground">
                                            Belum ada eksemplar buku
                                        </p>
                                        <button
                                            onClick={() =>
                                                setShowAddItemModal(true)
                                            }
                                            className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Tambah eksemplar pertama
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Pagination for items */}
                            {items.last_page > 1 && (
                                <div className="mt-6 flex items-center justify-center gap-2">
                                    <Link
                                        href={items.links[0]?.url || "#"}
                                        className={`rounded-xl p-2 transition-all ${
                                            items.current_page === 1
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
                                                    items.last_page
                                                ),
                                            },
                                            (_, i) => {
                                                let pageNum;
                                                if (items.last_page <= 5) {
                                                    pageNum = i + 1;
                                                } else if (
                                                    items.current_page <= 3
                                                ) {
                                                    pageNum = i + 1;
                                                } else if (
                                                    items.current_page >=
                                                    items.last_page - 2
                                                ) {
                                                    pageNum =
                                                        items.last_page - 4 + i;
                                                } else {
                                                    pageNum =
                                                        items.current_page -
                                                        2 +
                                                        i;
                                                }
                                                return (
                                                    <Link
                                                        key={pageNum}
                                                        href={route(
                                                            "admin.books.physical.show",
                                                            {
                                                                physical:
                                                                    book.id,
                                                                page: pageNum,
                                                            }
                                                        )}
                                                        className={`rounded-xl px-4 py-2 text-sm transition-all ${
                                                            items.current_page ===
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
                                            items.links[items.links.length - 1]
                                                ?.url || "#"
                                        }
                                        className={`rounded-xl p-2 transition-all ${
                                            items.current_page ===
                                            items.last_page
                                                ? "cursor-not-allowed opacity-50"
                                                : "hover:bg-muted"
                                        }`}
                                        preserveScroll
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Add Item Modal */}
            <AnimatePresence>
                {showAddItemModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowAddItemModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md rounded-3xl bg-card p-6 shadow-float"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                                    <Package className="h-8 w-8 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-semibold">
                                    Tambah Eksemplar
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Masukkan jumlah eksemplar buku yang akan
                                    ditambahkan
                                </p>
                            </div>
                            <div className="mt-6">
                                <label className="mb-2 block text-sm font-medium">
                                    Jumlah Eksemplar
                                </label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) =>
                                        setQuantity(
                                            Math.max(
                                                1,
                                                parseInt(e.target.value) || 1
                                            )
                                        )
                                    }
                                    min="1"
                                    max="100"
                                    className="w-full rounded-xl border-border bg-background px-4 py-3 text-center text-lg font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setShowAddItemModal(false)}
                                    className="flex-1 rounded-xl border-border bg-background px-4 py-2.5 text-sm font-medium transition-all hover:bg-muted"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleAddItem}
                                    disabled={loading}
                                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:scale-105 disabled:opacity-50"
                                >
                                    {loading ? "Menambahkan..." : "Tambah"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Item Confirmation Modal */}
            <AnimatePresence>
                {itemToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        onClick={() => setItemToDelete(null)}
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
                                    Hapus Eksemplar
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Apakah Anda yakin ingin menghapus eksemplar
                                    dengan barcode{" "}
                                    <span className="font-mono font-semibold">
                                        {itemToDelete.barcode}
                                    </span>
                                    ? Tindakan ini tidak dapat dibatalkan.
                                </p>
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => setItemToDelete(null)}
                                        className="flex-1 rounded-xl border-border bg-background px-4 py-2.5 text-sm font-medium transition-all hover:bg-muted"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleDeleteItem}
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
