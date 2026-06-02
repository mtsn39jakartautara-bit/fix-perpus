import { AppShell } from "@/Layouts/AppShell";
import { Borrowing, BorrowingStats } from "@/types/borrowing";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
    ArrowLeft,
    CalendarDays,
    Award,
    AlertTriangle,
    CreditCard,
    ChevronRight,
    Search,
    Filter,
    BookMarked,
    TrendingUp,
    Library,
    X,
} from "lucide-react";
import { Link, router, useForm } from "@inertiajs/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";

interface Props {
    borrowings: Borrowing[];
    stats: BorrowingStats;
}

export default function BorrowingsIndex({ borrowings, stats }: Props) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [selectedBook, setSelectedBook] = useState<Borrowing | null>(null);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { post } = useForm({});

    // Filter borrowings
    const filteredBorrowings = borrowings.filter((borrowing) => {
        const matchesSearch =
            borrowing.book_title
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            borrowing.book_author
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase());
        const matchesStatus =
            filterStatus === "all" || borrowing.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Group by status
    const activeBorrowings = filteredBorrowings.filter(
        (b) => b.status === "borrowed"
    );
    const lateBorrowings = filteredBorrowings.filter(
        (b) => b.status === "late"
    );
    const returnedBorrowings = filteredBorrowings.filter(
        (b) => b.status === "returned"
    );

    const handleReturn = async (borrowing: Borrowing) => {
        setIsLoading(true);

        router.post(
            route("borrowings.return", borrowing.id),
            {},
            {
                onSuccess: () => {
                    alert("Buku berhasil dikembalikan");
                },

                onError: (errors) => {
                    console.log(errors);
                    alert("Terjadi kesalahan");
                },

                onFinish: () => {
                    setIsLoading(false);
                    setShowReturnModal(false);
                    setSelectedBook(null);
                },
            }
        );
    };
    const handleExtend = async (borrowing: Borrowing) => {
        setIsLoading(true);

        router.post(
            route("borrowings.extend", borrowing.id),
            {},
            {
                onSuccess: () => {
                    alert("Perpanjangan berhasil");
                },

                onError: (errors) => {
                    console.log(errors);
                    alert("Terjadi kesalahan");
                },

                onFinish: () => {
                    setIsLoading(false);
                    setShowExtendModal(false);
                    setSelectedBook(null);
                },
            }
        );
    };

    const getStatusBadge = (status: string, isOverdue: boolean) => {
        if (status === "returned") {
            return {
                text: "Dikembalikan",
                color: "bg-green-100 text-green-700",
                dotColor: "bg-green-500",
            };
        } else if (status === "late" || isOverdue) {
            return {
                text: "Terlambat",
                color: "bg-red-100 text-red-700",
                dotColor: "bg-red-500",
            };
        } else {
            return {
                text: "Dipinjam",
                color: "bg-yellow-100 text-yellow-700",
                dotColor: "bg-blue-500",
            };
        }
    };

    const getDaysLeftColor = (daysLeft: number | null) => {
        if (daysLeft === null) return "text-muted-foreground";
        if (daysLeft < 0) return "text-destructive";
        if (daysLeft <= 3) return "text-orange-600";
        return "text-green-600";
    };

    const formatDate = (date: string) => {
        return format(new Date(date), "dd MMM yyyy", { locale: id });
    };

    return (
        <AppShell>
            <div className="mx-auto max-w-6xl px-5 pt-8 pb-24 lg:px-10 lg:pt-10">
                {/* Header */}
                <div className="mb-8">
                    <div className="mb-2 flex items-center justify-between">
                        <div>
                            <h1 className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-2xl font-bold tracking-tight text-transparent lg:text-3xl">
                                Peminjaman Buku
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Kelola dan pantau peminjaman buku Anda
                            </p>
                        </div>
                        <Link
                            href={route("dashboard.index")}
                            className="flex items-center gap-2 rounded-xl bg-card px-4 py-2 shadow-soft transition-all hover:shadow-md"
                        >
                            <Library className="h-5 w-5 text-primary" />
                            <span className="hidden text-sm font-medium sm:inline">
                                Kembali
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
                            <BookMarked className="h-5 w-5 text-primary" />
                            <span className="text-2xl font-bold text-primary">
                                {stats.total_borrowed}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Sedang Dipinjam
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/60">
                            Buku aktif
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-2xl bg-card p-4 shadow-soft"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span className="text-2xl font-bold text-primary">
                                {stats.total_returned}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Sudah Dikembalikan
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/60">
                            Total riwayat
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-2xl bg-card p-4 shadow-soft"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <span className="text-2xl font-bold text-destructive">
                                {stats.total_late}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Terlambat
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/60">
                            Perlu perhatian
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-2xl bg-card p-4 shadow-soft"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <CreditCard className="h-5 w-5 text-primary" />
                            <span className="text-2xl font-bold text-primary">
                                Rp {stats.total_fine.toLocaleString("id-ID")}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Total Denda
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/60">
                            Belum dibayar
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
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="rounded-xl border-0 bg-card pl-10 shadow-soft"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                        {["all", "borrowed", "late", "returned"].map(
                            (status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                                        filterStatus === status
                                            ? "bg-gradient-primary text-primary-foreground shadow-md"
                                            : "bg-card text-muted-foreground hover:bg-muted"
                                    }`}
                                >
                                    {status === "all" && "Semua"}
                                    {status === "borrowed" && "Dipinjam"}
                                    {status === "late" && "Terlambat"}
                                    {status === "returned" && "Dikembalikan"}
                                </button>
                            )
                        )}
                    </div>
                </div>

                {/* Active Borrowings Section */}
                {(activeBorrowings.length > 0 || lateBorrowings.length > 0) && (
                    <div className="mb-8">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="h-6 w-1 rounded-full bg-gradient-to-b from-primary to-primary/70"></div>
                            <h2 className="text-lg font-semibold">
                                Sedang Dipinjam
                            </h2>
                            <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                {activeBorrowings.length +
                                    lateBorrowings.length}{" "}
                                buku
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {[...lateBorrowings, ...activeBorrowings].map(
                                (borrowing, index) => {
                                    const statusBadge = getStatusBadge(
                                        borrowing.status,
                                        borrowing.is_overdue
                                    );

                                    return (
                                        <motion.div
                                            key={borrowing.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                delay: index * 0.1,
                                            }}
                                            className={`group relative overflow-hidden rounded-2xl bg-card shadow-soft transition-all hover:shadow-lg ${
                                                borrowing.is_overdue
                                                    ? "border-l-4 border-destructive"
                                                    : ""
                                            }`}
                                        >
                                            <div className="p-5">
                                                <div className="mb-3 flex items-start justify-between">
                                                    <div
                                                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${statusBadge.color}`}
                                                    >
                                                        {/* <StatusIcon className="h-3 w-3" /> */}
                                                        {statusBadge.text}
                                                    </div>
                                                    {!borrowing.returned_at &&
                                                        !borrowing.is_overdue && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedBook(
                                                                        borrowing
                                                                    );
                                                                    setShowExtendModal(
                                                                        true
                                                                    );
                                                                }}
                                                                className="text-xs font-medium text-primary hover:text-primary/80"
                                                            >
                                                                Perpanjang
                                                            </button>
                                                        )}
                                                </div>

                                                <h3 className="mb-1 line-clamp-2 text-lg font-semibold">
                                                    {borrowing.book_title}
                                                </h3>
                                                <p className="mb-3 text-sm text-muted-foreground">
                                                    {borrowing.book_author ||
                                                        "Tidak diketahui"}
                                                </p>

                                                <div className="mb-4 space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">
                                                            Dipinjam:{" "}
                                                            {formatDate(
                                                                borrowing.borrowed_at
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">
                                                            Jatuh tempo:{" "}
                                                            {formatDate(
                                                                borrowing.due_date
                                                            )}
                                                        </span>
                                                    </div>
                                                    {borrowing.days_left !==
                                                        null && (
                                                        <div
                                                            className={`flex items-center gap-2 text-sm font-medium ${getDaysLeftColor(
                                                                borrowing.days_left
                                                            )}`}
                                                        >
                                                            <AlertCircle className="h-4 w-4" />
                                                            <span>
                                                                {borrowing.days_left <
                                                                0
                                                                    ? `Terlambat ${Math.abs(
                                                                          borrowing.days_left
                                                                      )} hari`
                                                                    : `Sisa ${borrowing.days_left} hari`}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <Button
                                                    onClick={() => {
                                                        setSelectedBook(
                                                            borrowing
                                                        );
                                                        setShowReturnModal(
                                                            true
                                                        );
                                                    }}
                                                    className="w-full rounded-xl bg-gradient-primary text-primary-foreground shadow-md hover:shadow-lg"
                                                >
                                                    Kembalikan Buku
                                                </Button>
                                            </div>
                                        </motion.div>
                                    );
                                }
                            )}
                        </div>
                    </div>
                )}

                {/* History Section */}
                {returnedBorrowings.length > 0 && (
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <div className="h-6 w-1 rounded-full bg-gradient-to-b from-muted-foreground to-muted-foreground/70"></div>
                            <h2 className="text-lg font-semibold">
                                Riwayat Peminjaman
                            </h2>
                            <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                {returnedBorrowings.length} buku
                            </span>
                        </div>

                        <div className="space-y-3">
                            {returnedBorrowings.map((borrowing, index) => {
                                const statusBadge = getStatusBadge(
                                    borrowing.status,
                                    borrowing.is_overdue
                                );

                                return (
                                    <motion.div
                                        key={borrowing.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="rounded-2xl bg-card p-4 shadow-soft transition-all hover:shadow-md"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <div
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge.color}`}
                                                    >
                                                        {/* <StatusIcon className="h-3 w-3" /> */}
                                                        {statusBadge.text}
                                                    </div>
                                                    {borrowing.fine_amount >
                                                        0 && (
                                                        <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                                            <CreditCard className="h-3 w-3" />
                                                            Denda Rp{" "}
                                                            {borrowing.fine_amount.toLocaleString(
                                                                "id-ID"
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="text-base font-semibold">
                                                    {borrowing.book_title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {borrowing.book_author ||
                                                        "Tidak diketahui"}
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-3 text-sm sm:flex-row">
                                                <div className="flex items-center gap-2">
                                                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">
                                                        {formatDate(
                                                            borrowing.borrowed_at
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">
                                                        {borrowing.returned_at
                                                            ? formatDate(
                                                                  borrowing.returned_at
                                                              )
                                                            : "-"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {filteredBorrowings.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-3xl bg-card p-16 text-center shadow-soft"
                    >
                        <BookOpen className="mx-auto mb-4 h-20 w-20 text-muted-foreground/40" />
                        <h3 className="mb-2 text-lg font-semibold text-foreground">
                            Belum Ada Peminjaman
                        </h3>
                        <p className="mb-6 text-muted-foreground">
                            {searchTerm
                                ? "Tidak ada buku yang sesuai dengan pencarian"
                                : "Anda belum pernah meminjam buku"}
                        </p>
                        <Link
                            href={route("perpus.index")}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-2 text-primary-foreground shadow-md transition-all hover:shadow-lg"
                        >
                            <Library className="h-4 w-4" />
                            Jelajahi Koleksi Buku
                        </Link>
                    </motion.div>
                )}
            </div>

            {/* Return Confirmation Modal */}
            <AnimatePresence>
                {showReturnModal && selectedBook && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                        onClick={() => setShowReturnModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md rounded-3xl bg-card p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mb-4 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">
                                    Konfirmasi Pengembalian
                                </h3>
                                <p className="text-muted-foreground">
                                    Apakah Anda yakin ingin mengembalikan buku?
                                </p>
                                <p className="mt-3 text-sm font-medium text-foreground">
                                    "{selectedBook.book_title}"
                                </p>
                                {selectedBook.is_overdue && (
                                    <div className="mt-4 rounded-xl bg-destructive/10 p-3">
                                        <p className="text-sm text-destructive">
                                            ⚠️ Buku ini terlambat dan akan
                                            dikenakan denda
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setShowReturnModal(false)}
                                    variant="outline"
                                    className="flex-1 rounded-xl"
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={() => handleReturn(selectedBook)}
                                    disabled={isLoading}
                                    className="flex-1 rounded-xl bg-gradient-primary text-primary-foreground shadow-md hover:shadow-lg disabled:opacity-50"
                                >
                                    {isLoading
                                        ? "Memproses..."
                                        : "Ya, Kembalikan"}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Extend Confirmation Modal */}
            <AnimatePresence>
                {showExtendModal && selectedBook && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                        onClick={() => setShowExtendModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md rounded-3xl bg-card p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mb-4 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                    <CalendarDays className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">
                                    Perpanjang Peminjaman
                                </h3>
                                <p className="text-muted-foreground">
                                    Anda akan memperpanjang peminjaman selama 7
                                    hari
                                </p>
                                <p className="mt-3 text-sm font-medium text-foreground">
                                    "{selectedBook.book_title}"
                                </p>
                                <div className="mt-4 rounded-xl bg-primary/10 p-3">
                                    <p className="text-sm text-primary">
                                        Batas pengembalian baru:{" "}
                                        {format(
                                            new Date(selectedBook.due_date),
                                            "dd MMM yyyy",
                                            { locale: id }
                                        )}{" "}
                                        →{" "}
                                        {format(
                                            new Date(
                                                new Date(
                                                    selectedBook.due_date
                                                ).setDate(
                                                    new Date(
                                                        selectedBook.due_date
                                                    ).getDate() + 7
                                                )
                                            ),
                                            "dd MMM yyyy",
                                            { locale: id }
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setShowExtendModal(false)}
                                    variant="outline"
                                    className="flex-1 rounded-xl"
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={() => handleExtend(selectedBook)}
                                    disabled={isLoading}
                                    className="flex-1 rounded-xl bg-gradient-primary text-primary-foreground shadow-md hover:shadow-lg disabled:opacity-50"
                                >
                                    {isLoading
                                        ? "Memproses..."
                                        : "Ya, Perpanjang"}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AppShell>
    );
}
