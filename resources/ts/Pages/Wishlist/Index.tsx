import { AppShell } from "@/Layouts/AppShell";
import { Wishlist, WishlistStats, Category } from "@/types/wishlist";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    BookOpen,
    Star,
    Trash2,
    Edit2,
    X,
    Search,
    CheckCircle,
    Award,
    BookMarked,
    Sparkles,
    Calendar,
} from "lucide-react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { format } from "date-fns";
import { id, se } from "date-fns/locale";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";

interface Props {
    wishlists: Wishlist[];
    stats: WishlistStats;
    recommendations: any[];
}

export default function WishlistIndex({
    wishlists,
    stats,
    recommendations,
}: Props) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPriority, setFilterPriority] = useState<string>("all");
    const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(
        null
    );
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editForm, setEditForm] = useState({
        notes: "",
        priority: 3,
    });

    const { post, put, delete: destroy } = useForm({});

    // Get primary color gradient (hsl(180 92% 26%))
    const getPrimaryGradient = () => {
        return "from-[hsl(180,92%,26%)] to-[hsl(180,92%,20%)]";
    };

    // Filter wishlists
    const filteredWishlists = wishlists.filter((wishlist) => {
        const matchesSearch =
            wishlist.book.title
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            wishlist.book.author
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase());
        const matchesPriority =
            filterPriority === "all" ||
            (filterPriority === "high" && wishlist.priority >= 4) ||
            (filterPriority === "medium" && wishlist.priority === 3) ||
            (filterPriority === "low" && wishlist.priority <= 2);
        return matchesSearch && matchesPriority;
    });

    // Group by priority
    const highPriority = filteredWishlists.filter((w) => w.priority >= 4);
    const mediumPriority = filteredWishlists.filter((w) => w.priority === 3);
    const lowPriority = filteredWishlists.filter((w) => w.priority <= 2);

    const handleEdit = (wishlist: Wishlist) => {
        setSelectedWishlist(wishlist);
        setEditForm({
            notes: wishlist.notes || "",
            priority: wishlist.priority,
        });
        setShowEditModal(true);
    };

    const handleUpdate = () => {
        setIsLoading(true);

        try {
            if (selectedWishlist) {
                router.put(
                    route("wishlist.update", selectedWishlist?.id),
                    editForm,
                    {
                        onSuccess: () => {
                            alert("Wishlist berhasil diupdate");
                        },

                        onError: (errors) => {
                            console.log(errors);
                            alert("Terjadi kesalahan");
                        },

                        onFinish: () => {
                            setIsLoading(false);
                            setShowEditModal(false);
                        },
                    }
                );
            }
        } catch (error) {
            console.log(error);
            setIsLoading(false);
            setShowEditModal(false);
        }
    };

    const handleDelete = () => {
        setIsLoading(true);

        try {
            if (selectedWishlist) {
                router.delete(route("wishlist.destroy", selectedWishlist?.id), {
                    onSuccess: () => {
                        alert("Wishlist berhasil dihapus");
                    },

                    onError: (errors) => {
                        console.log(errors);
                        alert("Terjadi kesalahan");
                    },

                    onFinish: () => {
                        setIsLoading(false);
                        setShowDeleteModal(false);
                    },
                });
            }
        } catch (error) {
            console.log(error);
            setIsLoading(false);
            setShowDeleteModal(false);
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;

        setIsLoading(true);

        router.post(
            route("wishlist.bulk-destroy"),
            {
                ids: selectedIds,
            },
            {
                onSuccess: () => {
                    alert("Wishlist berhasil dihapus");
                },

                onError: (errors) => {
                    console.log(errors);
                    alert("Terjadi kesalahan");
                },

                onFinish: () => {
                    setIsLoading(false);
                    setSelectedIds([]);
                },
            }
        );
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const getPriorityColor = (priority: number) => {
        if (priority >= 4)
            return "bg-destructive/10 text-destructive border-destructive/20";
        if (priority === 3)
            return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
        return "bg-green-500/10 text-green-600 border-green-500/20";
    };

    const getPriorityIcon = (priority: number) => {
        if (priority >= 4) return <Star className="h-4 w-4" />;
        if (priority === 3) return <Award className="h-4 w-4" />;
        return <BookMarked className="h-4 w-4" />;
    };

    const formatDate = (date: string) => {
        return format(new Date(date), "dd MMM yyyy", { locale: id });
    };

    return (
        <>
            <Head title="Wishlist" />

            <AppShell>
                <div className="min-h-screen">
                    <div className="mx-auto max-w-6xl px-5 pt-8 pb-24 lg:px-10 lg:pt-10">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="mb-2 flex items-center justify-between">
                                <div>
                                    <h1 className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-2xl font-bold tracking-tight text-transparent lg:text-3xl">
                                        Wishlist Saya
                                    </h1>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Koleksi buku yang ingin Anda baca
                                    </p>
                                </div>
                                <Link
                                    href={route("perpus.index")}
                                    className="flex items-center gap-2 rounded-xl bg-card px-4 py-2 shadow-soft transition-all hover:shadow-md"
                                >
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    <span className="hidden text-sm font-medium sm:inline">
                                        Jelajahi Buku
                                    </span>
                                </Link>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="rounded-2xl bg-card p-4 shadow-soft"
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <Heart className="h-5 w-5 text-primary" />
                                    <span className="text-2xl font-bold text-primary">
                                        {stats.total}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Total Wishlist
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground/60">
                                    Buku yang diinginkan
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="rounded-2xl bg-card p-4 shadow-soft"
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <Star className="h-5 w-5 text-destructive" />
                                    <span className="text-2xl font-bold text-destructive">
                                        {stats.high_priority}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Prioritas Tinggi
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground/60">
                                    Segera dibaca
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="rounded-2xl bg-card p-4 shadow-soft"
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <Award className="h-5 w-5 text-yellow-600" />
                                    <span className="text-2xl font-bold text-yellow-600">
                                        {stats.medium_priority}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Prioritas Sedang
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground/60">
                                    Menarik untuk dibaca
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="rounded-2xl bg-card p-4 shadow-soft"
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <BookMarked className="h-5 w-5 text-green-600" />
                                    <span className="text-2xl font-bold text-green-600">
                                        {stats.low_priority}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Prioritas Rendah
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground/60">
                                    Bacaan santai
                                </p>
                            </motion.div>
                        </div>

                        {/* Search and Filter */}
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari judul atau penulis buku..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="rounded-xl border-0 bg-card pl-10 shadow-soft"
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                                {["all", "high", "medium", "low"].map(
                                    (priority) => (
                                        <button
                                            key={priority}
                                            onClick={() =>
                                                setFilterPriority(priority)
                                            }
                                            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                                                filterPriority === priority
                                                    ? "bg-gradient-primary text-primary-foreground shadow-md"
                                                    : "bg-card text-muted-foreground hover:bg-muted"
                                            }`}
                                        >
                                            {priority === "all" && "Semua"}
                                            {priority === "high" &&
                                                "Prioritas Tinggi"}
                                            {priority === "medium" &&
                                                "Prioritas Sedang"}
                                            {priority === "low" &&
                                                "Prioritas Rendah"}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {selectedIds.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 flex items-center justify-between rounded-xl bg-card p-3 shadow-soft"
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium">
                                        {selectedIds.length} dipilih
                                    </span>
                                </div>
                                <Button
                                    onClick={handleBulkDelete}
                                    className="gap-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Hapus
                                </Button>
                            </motion.div>
                        )}

                        {/* Wishlist Sections */}
                        {filteredWishlists.length > 0 ? (
                            <>
                                {/* High Priority Section */}
                                {highPriority.length > 0 && (
                                    <div className="mb-8">
                                        <div className="mb-4 flex items-center gap-2">
                                            <div className="h-6 w-1 rounded-full bg-gradient-to-b from-destructive to-destructive/80"></div>
                                            <h2 className="text-lg font-semibold">
                                                Prioritas Tinggi
                                            </h2>
                                            <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                                {highPriority.length} buku
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            {highPriority.map(
                                                (wishlist, index) => (
                                                    <WishlistCard
                                                        key={wishlist.id}
                                                        wishlist={wishlist}
                                                        isSelected={selectedIds.includes(
                                                            wishlist.id
                                                        )}
                                                        onSelect={() =>
                                                            toggleSelect(
                                                                wishlist.id
                                                            )
                                                        }
                                                        onEdit={() =>
                                                            handleEdit(wishlist)
                                                        }
                                                        onDelete={() => {
                                                            setSelectedWishlist(
                                                                wishlist
                                                            );
                                                            setShowDeleteModal(
                                                                true
                                                            );
                                                        }}
                                                        getPriorityColor={
                                                            getPriorityColor
                                                        }
                                                        getPriorityIcon={
                                                            getPriorityIcon
                                                        }
                                                        formatDate={formatDate}
                                                        index={index}
                                                        getPrimaryGradient={
                                                            getPrimaryGradient
                                                        }
                                                    />
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Medium Priority Section */}
                                {mediumPriority.length > 0 && (
                                    <div className="mb-8">
                                        <div className="mb-4 flex items-center gap-2">
                                            <div className="h-6 w-1 rounded-full bg-gradient-to-b from-yellow-500 to-yellow-600"></div>
                                            <h2 className="text-lg font-semibold">
                                                Prioritas Sedang
                                            </h2>
                                            <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                                {mediumPriority.length} buku
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            {mediumPriority.map(
                                                (wishlist, index) => (
                                                    <WishlistCard
                                                        key={wishlist.id}
                                                        wishlist={wishlist}
                                                        isSelected={selectedIds.includes(
                                                            wishlist.id
                                                        )}
                                                        onSelect={() =>
                                                            toggleSelect(
                                                                wishlist.id
                                                            )
                                                        }
                                                        onEdit={() =>
                                                            handleEdit(wishlist)
                                                        }
                                                        onDelete={() => {
                                                            setSelectedWishlist(
                                                                wishlist
                                                            );
                                                            setShowDeleteModal(
                                                                true
                                                            );
                                                        }}
                                                        getPriorityColor={
                                                            getPriorityColor
                                                        }
                                                        getPriorityIcon={
                                                            getPriorityIcon
                                                        }
                                                        formatDate={formatDate}
                                                        index={index}
                                                        getPrimaryGradient={
                                                            getPrimaryGradient
                                                        }
                                                    />
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Low Priority Section */}
                                {lowPriority.length > 0 && (
                                    <div className="mb-8">
                                        <div className="mb-4 flex items-center gap-2">
                                            <div className="h-6 w-1 rounded-full bg-gradient-to-b from-green-500 to-green-600"></div>
                                            <h2 className="text-lg font-semibold">
                                                Prioritas Rendah
                                            </h2>
                                            <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                                {lowPriority.length} buku
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            {lowPriority.map(
                                                (wishlist, index) => (
                                                    <WishlistCard
                                                        key={wishlist.id}
                                                        wishlist={wishlist}
                                                        isSelected={selectedIds.includes(
                                                            wishlist.id
                                                        )}
                                                        onSelect={() =>
                                                            toggleSelect(
                                                                wishlist.id
                                                            )
                                                        }
                                                        onEdit={() =>
                                                            handleEdit(wishlist)
                                                        }
                                                        onDelete={() => {
                                                            setSelectedWishlist(
                                                                wishlist
                                                            );
                                                            setShowDeleteModal(
                                                                true
                                                            );
                                                        }}
                                                        getPriorityColor={
                                                            getPriorityColor
                                                        }
                                                        getPriorityIcon={
                                                            getPriorityIcon
                                                        }
                                                        formatDate={formatDate}
                                                        index={index}
                                                        getPrimaryGradient={
                                                            getPrimaryGradient
                                                        }
                                                    />
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            // Empty State
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="rounded-3xl bg-card p-16 text-center shadow-soft"
                            >
                                <Heart className="mx-auto mb-4 h-20 w-20 text-muted-foreground/40" />
                                <h3 className="mb-2 text-lg font-semibold text-foreground">
                                    Wishlist Masih Kosong
                                </h3>
                                <p className="mb-6 text-muted-foreground">
                                    {searchTerm
                                        ? "Tidak ada buku yang sesuai dengan pencarian"
                                        : "Tambahkan buku favorit Anda ke wishlist"}
                                </p>
                                <Link
                                    href={route("perpus.index")}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-2 text-primary-foreground shadow-md transition-all hover:shadow-lg"
                                >
                                    <BookOpen className="h-4 w-4" />
                                    Jelajahi Koleksi Buku
                                </Link>
                            </motion.div>
                        )}

                        {/* Recommendations */}

                        {recommendations.length > 0 &&
                            filteredWishlists.length > 0 && (
                                <div className="mt-12">
                                    <div className="mb-4 flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                        <h2 className="text-lg font-semibold">
                                            Rekomendasi Untuk Anda
                                        </h2>
                                    </div>

                                    <div className="grid  gap-3 grid-cols-3 lg:grid-cols-4">
                                        {recommendations
                                            .slice(0, 4)
                                            .map((book, index) => {
                                                return (
                                                    <Link
                                                        key={book.id}
                                                        href={route(
                                                            "perpus.show",
                                                            book.uuid || book.id
                                                        )}
                                                        className="group cursor-pointer"
                                                    >
                                                        {/* Book Card - Like a real book */}
                                                        <div className="relative transition-all duration-300 group-hover:-translate-y-1">
                                                            {/* Book shadow */}
                                                            <div className="absolute -bottom-1 left-1 right-1 h-3 rounded-full bg-black/20 opacity-0 blur-md transition-opacity group-hover:opacity-100 -z-10" />

                                                            {/* Book cover */}
                                                            <div className="relative overflow-hidden rounded-lg shadow-md transition-all group-hover:shadow-lg">
                                                                {/* Book content with primary color gradient */}
                                                                <div
                                                                    className={`relative flex flex-col bg-gradient-to-br ${getPrimaryGradient()}`}
                                                                >
                                                                    {/* Cover image or placeholder */}
                                                                    <div className="relative aspect-[3/4] w-full">
                                                                        {book.cover ? (
                                                                            <img
                                                                                src={
                                                                                    book.cover
                                                                                }
                                                                                alt={
                                                                                    book.title
                                                                                }
                                                                                className="h-full w-full object-cover"
                                                                                loading="lazy"
                                                                            />
                                                                        ) : (
                                                                            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-black/10">
                                                                                <BookMarked
                                                                                    className="h-10 w-10 text-white/60"
                                                                                    strokeWidth={
                                                                                        1
                                                                                    }
                                                                                />
                                                                                <div className="text-center">
                                                                                    <p className="text-[10px] font-medium text-white/80">
                                                                                        E-Book
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Book mark ribbon */}
                                                                        <div className="absolute -right-3 -top-6 h-8 w-8 rotate-[-5deg] bg-amber-400 shadow-md" />
                                                                    </div>

                                                                    {/* Book info overlay on hover */}
                                                                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 rounded-lg">
                                                                        <p className="line-clamp-2 text-[9px] font-medium text-white leading-tight">
                                                                            {
                                                                                book.title
                                                                            }
                                                                        </p>
                                                                        <p className="mt-0.5 text-[7px] text-white/80">
                                                                            {book.author?.substring(
                                                                                0,
                                                                                30
                                                                            ) ||
                                                                                "Unknown"}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Book title below */}
                                                            <div className="mt-2 text-center">
                                                                <p className="line-clamp-2 text-[10px] font-medium text-foreground">
                                                                    {book.title}
                                                                </p>
                                                                <p className="mt-0.5 text-[8px] text-muted-foreground">
                                                                    {book.author
                                                                        ?.split(
                                                                            " "
                                                                        )
                                                                        .slice(
                                                                            0,
                                                                            2
                                                                        )
                                                                        .join(
                                                                            " "
                                                                        ) ||
                                                                        "Unknown"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}
                    </div>
                </div>

                {/* Edit Modal */}
                <AnimatePresence>
                    {showEditModal && selectedWishlist && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                            onClick={() => setShowEditModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-md rounded-3xl bg-card p-6"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-xl font-semibold">
                                        Edit Wishlist
                                    </h3>
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                    >
                                        <X className="h-5 w-5 text-muted-foreground" />
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                                        Buku: {selectedWishlist.book.title}
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <label className="mb-2 block text-sm font-medium">
                                        Prioritas
                                    </label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((priority) => (
                                            <button
                                                key={priority}
                                                onClick={() =>
                                                    setEditForm({
                                                        ...editForm,
                                                        priority,
                                                    })
                                                }
                                                className={`flex-1 rounded-lg py-2 transition-all ${
                                                    editForm.priority ===
                                                    priority
                                                        ? "bg-gradient-primary text-primary-foreground"
                                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                                }`}
                                            >
                                                {priority}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {editForm.priority >= 4
                                            ? "Prioritas Tinggi"
                                            : editForm.priority === 3
                                            ? "Prioritas Sedang"
                                            : "Prioritas Rendah"}
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <label className="mb-2 block text-sm font-medium">
                                        Catatan (Opsional)
                                    </label>
                                    <textarea
                                        value={editForm.notes}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                notes: e.target.value,
                                            })
                                        }
                                        rows={3}
                                        className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Tambahkan catatan tentang buku ini..."
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => setShowEditModal(false)}
                                        variant="outline"
                                        className="flex-1 rounded-xl"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={handleUpdate}
                                        disabled={isLoading}
                                        className="flex-1 rounded-xl bg-gradient-primary text-primary-foreground shadow-md hover:shadow-lg disabled:opacity-50"
                                    >
                                        {isLoading
                                            ? "Menyimpan..."
                                            : "Simpan Perubahan"}
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {showDeleteModal && selectedWishlist && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-md rounded-3xl bg-card p-6"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="mb-4 text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                                        <Trash2 className="h-8 w-8 text-destructive" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold">
                                        Hapus dari Wishlist?
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Apakah Anda yakin ingin menghapus buku
                                        ini dari wishlist?
                                    </p>
                                    <p className="mt-3 text-sm font-medium text-foreground">
                                        "{selectedWishlist.book.title}"
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() =>
                                            setShowDeleteModal(false)
                                        }
                                        variant="outline"
                                        className="flex-1 rounded-xl"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        onClick={handleDelete}
                                        disabled={isLoading}
                                        className="flex-1 rounded-xl bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 disabled:opacity-50"
                                    >
                                        {isLoading
                                            ? "Menghapus..."
                                            : "Ya, Hapus"}
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </AppShell>
        </>
    );
}

// Wishlist Card Component with Real Book Style
interface WishlistCardProps {
    wishlist: Wishlist;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    getPriorityColor: (priority: number) => string;
    getPriorityIcon: (priority: number) => any;
    formatDate: (date: string) => string;
    index: number;
    getPrimaryGradient: () => string;
}

// Wishlist Card Component with Real Book Style - Horizontal Layout
interface WishlistCardProps {
    wishlist: Wishlist;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    getPriorityColor: (priority: number) => string;
    getPriorityIcon: (priority: number) => any;
    formatDate: (date: string) => string;
    index: number;
    getPrimaryGradient: () => string;
}

function WishlistCard({
    wishlist,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    getPriorityColor,
    getPriorityIcon,
    formatDate,
    index,
    getPrimaryGradient,
}: WishlistCardProps) {
    const handleCardClick = (e: React.MouseEvent) => {
        // Don't navigate if clicking on checkbox, edit, or delete buttons
        const target = e.target as HTMLElement;
        if (
            target.closest('input[type="checkbox"]') ||
            target.closest("button")
        ) {
            return;
        }
        router.get(route("perpus.show", { uuid: wishlist.book.uuid }));
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-card shadow-soft transition-all hover:shadow-lg ${
                isSelected ? "ring-2 ring-primary" : ""
            }`}
            onClick={handleCardClick}
        >
            <div className="p-4">
                {/* Header with Checkbox and Priority Badge */}
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={onSelect}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />

                        <div
                            className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(
                                wishlist.priority
                            )}`}
                        >
                            {getPriorityIcon(wishlist.priority)}
                            {wishlist.priority_label.label}
                        </div>
                    </div>

                    <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onEdit}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                            title="Edit wishlist"
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            title="Hapus dari wishlist"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* Horizontal Layout: Book Cover Left, Info Right */}
                <div className="flex gap-4">
                    {/* Book Cover - Real Book Style (Left Side) */}
                    <div className="relative w-28 flex-shrink-0 transition-all duration-300 group-hover:-translate-y-1">
                        {/* Book shadow */}
                        <div className="absolute -bottom-1 left-1 right-1 h-3 rounded-full bg-black/20 opacity-0 blur-md transition-opacity group-hover:opacity-100 -z-10" />

                        {/* Book cover */}
                        <div className="relative overflow-hidden rounded-lg shadow-md transition-all group-hover:shadow-lg">
                            {/* Book spine effect */}
                            <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-r from-black/20 to-transparent z-10 rounded-l-lg" />

                            {/* Book content */}
                            <div
                                className={`relative flex flex-col bg-gradient-to-br ${getPrimaryGradient()}`}
                            >
                                {/* Cover image or placeholder */}
                                <div className="relative aspect-[3/4] w-full">
                                    <div
                                        className={`flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-[hsl(180,92%,26%)] to-[hsl(180,92%,20%)]`}
                                    >
                                        <BookMarked
                                            className="h-8 w-8 text-white/60"
                                            strokeWidth={1}
                                        />
                                        <div className="text-center px-1">
                                            <p className="text-[8px] font-medium text-white/80 leading-tight">
                                                E-Book
                                            </p>
                                        </div>
                                    </div>

                                    {/* Book mark ribbon */}
                                    <div className="absolute -right-3 -top-6 h-8 w-8 rotate-[-5deg] bg-amber-400 shadow-md" />
                                </div>

                                {/* Book info overlay on hover */}
                                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 rounded-lg">
                                    <p className="line-clamp-2 text-[9px] font-medium text-white leading-tight">
                                        {wishlist.book.title}
                                    </p>
                                    <p className="mt-0.5 text-[7px] text-white/80">
                                        {wishlist.book.author?.substring(0, 30)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Book Info (Right Side) */}
                    <div className="min-w-0 flex-1">
                        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                            {wishlist.book.title}
                        </h3>

                        <p className="mb-2 text-xs text-muted-foreground">
                            {wishlist.book.author || "Penulis tidak diketahui"}
                        </p>

                        {/* Categories */}
                        <div className="mb-2 flex flex-wrap gap-1">
                            {wishlist.book.categories.slice(0, 3).map((cat) => (
                                <span
                                    key={cat.id}
                                    className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground"
                                >
                                    {cat.name}
                                </span>
                            ))}
                        </div>

                        {/* Notes */}
                        {wishlist.notes && (
                            <div className="mb-2 rounded-md bg-muted/30 p-1.5">
                                <p className="text-[10px] text-muted-foreground line-clamp-2">
                                    <span className="font-medium">
                                        Catatan:
                                    </span>{" "}
                                    {wishlist.notes}
                                </p>
                            </div>
                        )}

                        {/* Footer Info */}
                        <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-2.5 w-2.5" />
                                <span>{formatDate(wishlist.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Heart className="h-2.5 w-2.5" />
                                <span>
                                    {wishlist.book.wishlist_count} orang
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
