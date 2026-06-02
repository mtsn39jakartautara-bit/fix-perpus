// resources/js/Pages/Admin/Borrowing/Index.tsx

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Badge } from "@/Components/ui/badge";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Separator } from "@/Components/ui/separator";
import {
    QrCode,
    BookOpen,
    Search,
    UserPlus,
    Barcode,
    CheckCircle,
    AlertCircle,
    X,
    Plus,
    Printer,
    Calendar,
    User as UserIcon,
    BookMarked,
    Loader2,
    Camera,
    CameraOff,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { User, SelectedBookItem, BorrowingForm } from "@/types/borrowing-admin";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { AdminLayout } from "@/Layouts/AppShellAdmin";
import QrScanner from "qr-scanner";
import debounce from "lodash/debounce";

// Komponen Scanner Barcode dengan qr-scanner (FIXED VERSION)
const BarcodeScanner = ({
    onScan,
    onClose,
    scanMode,
    isOpen,
}: {
    onScan: (result: string) => void;
    onClose: () => void;
    scanMode: "user" | "book";
    isOpen: boolean;
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerRef = useRef<QrScanner | null>(null);

    const [scanning, setScanning] = useState(true);

    const [manualBarcode, setManualBarcode] = useState("");

    const [scanResult, setScanResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const [hasScanned, setHasScanned] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setScanning(true);
            setHasScanned(false);
            setScanResult(null);
            setManualBarcode("");
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !scanning) {
            return;
        }

        let cancelled = false;

        const startCamera = async () => {
            try {
                await new Promise((resolve) => setTimeout(resolve, 300));

                if (cancelled) return;

                const video = videoRef.current;

                if (!video) {
                    console.error("Video element not found");
                    return;
                }

                if (scannerRef.current) {
                    scannerRef.current.stop();
                    scannerRef.current.destroy();
                    scannerRef.current = null;
                }

                const scanner = new QrScanner(
                    video,
                    (result) => {
                        if (hasScanned) return;

                        setHasScanned(true);

                        scanner.stop();

                        handleScan(result.data);
                    },
                    {
                        preferredCamera: "environment",
                        highlightScanRegion: true,
                        highlightCodeOutline: true,
                        onDecodeError: () => {},
                    }
                );

                scannerRef.current = scanner;

                await scanner.start();

                console.log("Scanner started");
            } catch (error) {
                console.error(error);

                setScanResult({
                    success: false,
                    message:
                        "Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.",
                });
            }
        };

        startCamera();

        return () => {
            cancelled = true;

            if (scannerRef.current) {
                scannerRef.current.stop();
                scannerRef.current.destroy();
                scannerRef.current = null;
            }
        };
    }, [isOpen, scanning]);

    const handleScan = async (barcode: string) => {
        if (!barcode) return;

        onScan(barcode);

        setScanResult({
            success: true,
            message:
                scanMode === "user" ? "User ditemukan!" : "Buku ditemukan!",
        });

        setScanning(false);

        setTimeout(() => {
            onClose();
        }, 1500);
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!manualBarcode.trim()) return;

        handleScan(manualBarcode.trim());
    };

    const stopScanning = () => {
        if (scannerRef.current) {
            scannerRef.current.stop();
        }

        setScanning(false);

        onClose();
    };

    const startScanning = () => {
        setHasScanned(false);
        setScanResult(null);
        setScanning(true);
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    stopScanning();
                }
            }}
        >
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        Scan Barcode {scanMode === "user" ? "User" : "Buku"}
                    </DialogTitle>

                    <DialogDescription>
                        Arahkan kamera ke barcode
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {!scanning ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Camera className="h-20 w-20 text-primary" />

                            <Button className="mt-4" onClick={startScanning}>
                                Buka Kamera
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                                <video
                                    ref={videoRef}
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    muted
                                    playsInline
                                />

                                <div className="absolute inset-0 border border-primary/50 rounded-lg" />

                                {scanResult && (
                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                        <div className="bg-green-500 text-white rounded-lg p-4">
                                            {scanResult.message}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-center">
                                <Button
                                    variant="outline"
                                    onClick={stopScanning}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Tutup Kamera
                                </Button>
                            </div>

                            <Separator />

                            <form
                                onSubmit={handleManualSubmit}
                                className="relative"
                            >
                                <Input
                                    value={manualBarcode}
                                    onChange={(e) =>
                                        setManualBarcode(e.target.value)
                                    }
                                    placeholder="Atau input barcode manual"
                                />

                                <Button
                                    type="submit"
                                    size="sm"
                                    className="absolute right-1 top-1/2 -translate-y-1/2"
                                >
                                    Submit
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Komponen Pencarian Buku Manual
const BookSearchManual = ({
    onSelectBookItem,
    selectedBookItemIds,
    onClose,
}: {
    onSelectBookItem: (bookItem: SelectedBookItem) => void;
    selectedBookItemIds: number[];
    onClose: () => void;
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [physicalBooks, setPhysicalBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPhysicalBook, setSelectedPhysicalBook] = useState<any>(null);
    const [bookItems, setBookItems] = useState<SelectedBookItem[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);

    const searchBooks = async () => {
        setLoading(true);
        try {
            const response = await axios.post("/admin/borrowing/search-books", {
                search: searchTerm,
                per_page: 20,
            });
            setPhysicalBooks(response.data.physical_books.data);
        } catch (error) {
            toast.error("Gagal mencari buku");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchBooks();
    };

    const selectPhysicalBook = async (physicalBook: any) => {
        setLoadingItems(true);
        setSelectedPhysicalBook(physicalBook);
        try {
            const response = await axios.get(
                `/admin/borrowing/book-items/${physicalBook.id}`
            );
            setBookItems(response.data.book_items);
        } catch (error) {
            toast.error("Gagal mengambil data buku");
        } finally {
            setLoadingItems(false);
        }
    };

    const handleSelectBookItem = (bookItem: SelectedBookItem) => {
        if (selectedBookItemIds.includes(bookItem.id)) {
            toast.warning("Buku sudah ditambahkan");
            return;
        }
        onSelectBookItem(bookItem);
        onClose();
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Cari Buku Manual</DialogTitle>
                    <DialogDescription>
                        Cari buku berdasarkan judul, penulis, atau penerbit
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            placeholder="Cari buku..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Search className="h-4 w-4" />
                            )}
                            Cari
                        </Button>
                    </form>

                    {!selectedPhysicalBook ? (
                        <ScrollArea className="h-[400px]">
                            <div className="space-y-2">
                                {physicalBooks.map((book) => (
                                    <Card
                                        key={book.id}
                                        className="cursor-pointer hover:bg-primary-soft transition-colors"
                                        onClick={() => selectPhysicalBook(book)}
                                    >
                                        <CardContent className="p-4">
                                            <h4 className="font-semibold">
                                                {book.title}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {book.author} • {book.publisher}{" "}
                                                • Stok: {book.stock}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                                {physicalBooks.length === 0 && !loading && (
                                    <div className="text-center py-8 text-gray-500">
                                        Tidak ada buku ditemukan
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="ghost"
                                    onClick={() =>
                                        setSelectedPhysicalBook(null)
                                    }
                                    size="sm"
                                >
                                    ← Kembali
                                </Button>
                                <h3 className="font-semibold">
                                    {selectedPhysicalBook.title}
                                </h3>
                            </div>
                            <Separator />
                            {loadingItems ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : (
                                <ScrollArea className="h-[300px]">
                                    <div className="space-y-2">
                                        {bookItems.map((item) => (
                                            <Card
                                                key={item.id}
                                                className={`cursor-pointer transition-colors ${
                                                    selectedBookItemIds.includes(
                                                        item.id
                                                    )
                                                        ? "bg-mint border-primary/20 opacity-50"
                                                        : "hover:bg-primary-soft"
                                                }`}
                                                onClick={() =>
                                                    handleSelectBookItem(item)
                                                }
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="text-sm font-mono">
                                                                {item.barcode}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                Status:{" "}
                                                                {item.status}
                                                            </p>
                                                        </div>
                                                        {selectedBookItemIds.includes(
                                                            item.id
                                                        ) && (
                                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Komponen Utama
export default function BorrowingIndex() {
    const [activeTab, setActiveTab] = useState<"scan" | "manual">("scan");
    const [step, setStep] = useState<"user" | "books">("user");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedBooks, setSelectedBooks] = useState<SelectedBookItem[]>([]);
    const [dueDate, setDueDate] = useState<string>(
        format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
    );
    const [loading, setLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [showBookSearch, setShowBookSearch] = useState(false);
    const [scanMode, setScanMode] = useState<"user" | "book">("user");
    const [isBorrowedBooksExpanded, setIsBorrowedBooksExpanded] =
        useState(false);

    const handleUserScan = async (barcode: string) => {
        try {
            const response = await axios.post("/admin/borrowing/find-user", {
                search: barcode,
            });
            if (response.data.success) {
                setSelectedUser(response.data.user);
                setStep("books");
                toast.success(`User ditemukan: ${response.data.user.name}`);
                setShowScanner(false);
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "User tidak ditemukan"
            );
        }
    };

    console.log(selectedUser);

    const handleBookScan = (barcode: string) => {
        router.post(
            route("admin.borrowing.find-book-item"),
            {
                barcode,
            },
            {
                preserveScroll: true,
                preserveState: true,

                onSuccess: (page: any) => {
                    console.log(page.props.flash);
                    const bookItem = page.props.flash?.book_item;

                    console.log(page.props.flash?.book_item);

                    if (!bookItem) {
                        return;
                    }

                    if (selectedBooks.some((book) => book.id === bookItem.id)) {
                        toast.warning("Buku sudah ditambahkan");
                        return;
                    }

                    if (
                        selectedBooks.length >=
                        (selectedUser?.remaining_quota || 3)
                    ) {
                        toast.error(
                            `Maksimal peminjaman ${selectedUser?.max_borrow_limit} buku`
                        );
                        return;
                    }

                    setSelectedBooks((prev) => [...prev, bookItem]);

                    toast.success(
                        `Buku "${bookItem.physical_book.title}" ditambahkan`
                    );

                    setShowScanner(false);
                },

                onError: (errors) => {
                    console.log(errors);
                    toast.error(errors.message || "Buku tidak ditemukan");
                },
            }
        );
    };

    const handleAddBookManual = (bookItem: SelectedBookItem) => {
        if (selectedBooks.length >= (selectedUser?.remaining_quota || 3)) {
            toast.error(
                `Maksimal peminjaman ${selectedUser?.max_borrow_limit} buku`
            );
            return;
        }
        setSelectedBooks([...selectedBooks, bookItem]);
        toast.success(`Buku "${bookItem.physical_book.title}" ditambahkan`);
    };

    const handleRemoveBook = (bookId: number) => {
        setSelectedBooks(selectedBooks.filter((book) => book.id !== bookId));
        toast.info("Buku dihapus dari daftar");
    };

    const handleSubmit = async () => {
        if (!selectedUser) {
            toast.error("Pilih user terlebih dahulu");
            return;
        }

        if (selectedBooks.length === 0) {
            toast.error("Pilih minimal 1 buku");
            return;
        }

        if (!dueDate) {
            toast.error("Pilih tanggal pengembalian");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post("/admin/borrowing/store", {
                user_id: selectedUser.id,
                book_item_ids: selectedBooks.map((book) => book.id),
                due_date: dueDate,
            });

            if (response.data.success) {
                toast.success(response.data.message);
                // Reset form
                setSelectedUser(null);
                setSelectedBooks([]);
                setStep("user");
                setDueDate(
                    format(
                        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        "yyyy-MM-dd"
                    )
                );

                // Tampilkan struk peminjaman
                // printReceipt(response.data);
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Gagal memproses peminjaman"
            );
        } finally {
            setLoading(false);
        }
    };

    const printReceipt = (data: any) => {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Struk Peminjaman</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .content { margin-bottom: 20px; }
                        .book-list { margin: 10px 0; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>STRUK PEMINJAMAN BUKU</h2>
                        <p>Perpustakaan Digital</p>
                    </div>
                    <div class="content">
                        <p><strong>Peminjam:</strong> ${selectedUser?.name}</p>
                        <p><strong>Role:</strong> ${selectedUser?.role_name}</p>
                        <p><strong>Tanggal Pinjam:</strong> ${format(
                            new Date(),
                            "dd/MM/yyyy HH:mm"
                        )}</p>
                        <p><strong>Jatuh Tempo:</strong> ${data.due_date}</p>
                    </div>
                    <div class="book-list">
                        <strong>Daftar Buku:</strong>
                        <ul>
                            ${data.borrowed_books
                                .map((book: string) => `<li>${book}</li>`)
                                .join("")}
                        </ul>
                    </div>
                    <div class="footer">
                        <p>Terima kasih telah menggunakan layanan perpustakaan kami</p>
                        <p>Harap kembalikan buku tepat waktu</p>
                    </div>
                </body>
                </html>
            `);
            printWindow.print();
            printWindow.close();
        }
    };

    const resetBorrowing = () => {
        setSelectedUser(null);
        setSelectedBooks([]);
        setStep("user");
    };

    // Form pencarian manual user
    // Form pencarian manual user - PERBAIKAN
    const ManualUserSearch = () => {
        const [searchValue, setSearchValue] = useState("");
        const [isSearching, setIsSearching] = useState(false);
        const [searchResults, setSearchResults] = useState<User[]>([]);
        const [showResults, setShowResults] = useState(false);

        // Debounced search function
        const debouncedSearch = useRef(
            debounce(async (query: string) => {
                if (!query.trim() || query.length < 2) {
                    setSearchResults([]);
                    setShowResults(false);
                    setIsSearching(false);
                    return;
                }

                setIsSearching(true);

                try {
                    const response = await axios.get(
                        "/admin/borrowing/search-users",
                        {
                            params: { search: query },
                        }
                    );

                    if (response.data.success && response.data.users) {
                        setSearchResults(response.data.users);
                        setShowResults(true);
                    } else {
                        setSearchResults([]);
                        setShowResults(true);
                    }
                } catch (error) {
                    console.error("Search error:", error);
                    setSearchResults([]);
                    setShowResults(true);
                } finally {
                    setIsSearching(false);
                }
            }, 500)
        ).current;

        useEffect(() => {
            debouncedSearch(searchValue);
            return () => debouncedSearch.cancel();
        }, [searchValue, debouncedSearch]);

        const handleSelectUser = (user: User) => {
            setSelectedUser(user);
            setStep("books");
            toast.success(`User ditemukan: ${user.name}`);
            setSearchValue("");
            setSearchResults([]);
            setShowResults(false);
        };

        return (
            <Card className="bg-primary-soft border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5" />
                        Cari User
                    </CardTitle>
                    <CardDescription>
                        Cari berdasarkan NIS, NIP, Email, atau Nama
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Ketik NIS / NIP / Email / Nama..."
                                value={searchValue}
                                onChange={(e) => {
                                    setSearchValue(e.target.value);
                                    if (!e.target.value.trim()) {
                                        setShowResults(false);
                                        setSearchResults([]);
                                    }
                                }}
                                className="pl-10"
                                autoComplete="off"
                            />
                            {isSearching && (
                                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                        </div>
                    </div>

                    {/* Search Results */}
                    {showResults && searchValue.length >= 2 && (
                        <div className="relative">
                            <div className="absolute z-10 w-full mt-1 bg-popover rounded-md border shadow-md">
                                <div className="max-h-80 overflow-y-auto">
                                    {searchResults.length === 0 &&
                                    !isSearching ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <UserIcon className="h-12 w-12 text-muted-foreground/50" />
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                User tidak ditemukan
                                            </p>
                                        </div>
                                    ) : (
                                        searchResults.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer transition-colors border-b last:border-b-0"
                                                onClick={() =>
                                                    handleSelectUser(user)
                                                }
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm truncate">
                                                        {user.name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {user.role_name}
                                                        </Badge>
                                                        {user.nis && (
                                                            <span className="text-xs text-muted-foreground">
                                                                NIS: {user.nis}
                                                            </span>
                                                        )}
                                                        {user.nip && (
                                                            <span className="text-xs text-muted-foreground">
                                                                NIP: {user.nip}
                                                            </span>
                                                        )}
                                                        {user.class && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Kelas:{" "}
                                                                {user.class}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {user.email}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Poin:{" "}
                                                            {user.total_points}
                                                        </p>
                                                        <Badge
                                                            variant={
                                                                user.remaining_quota >
                                                                0
                                                                    ? "default"
                                                                    : "destructive"
                                                            }
                                                            className="text-xs"
                                                        >
                                                            Sisa:{" "}
                                                            {
                                                                user.remaining_quota
                                                            }
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="shrink-0"
                                                >
                                                    Pilih
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    // Komponen Utama - bagian return untuk step === "user" perlu diubah
    if (step === "user") {
        return (
            <AdminLayout>
                <Head title="Peminjaman Buku" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                Peminjaman Buku
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Pilih metode peminjaman buku
                            </p>
                        </div>

                        <Tabs
                            value={activeTab}
                            onValueChange={(v) =>
                                setActiveTab(v as "scan" | "manual")
                            }
                            className="space-y-6"
                        >
                            <TabsList className="grid w-full max-w-md grid-cols-2">
                                <TabsTrigger value="scan" className="gap-2">
                                    <QrCode className="h-4 w-4" />
                                    Scan Barcode
                                </TabsTrigger>
                                <TabsTrigger value="manual" className="gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    Manual
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="scan">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <QrCode className="h-5 w-5" />
                                            Scan Barcode User
                                        </CardTitle>
                                        <CardDescription>
                                            Scan barcode kartu anggota
                                            perpustakaan
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button
                                            onClick={() => {
                                                setScanMode("user");
                                                setShowScanner(true);
                                            }}
                                            className="w-full"
                                            size="lg"
                                        >
                                            <Camera className="h-5 w-5 mr-2" />
                                            Buka Scanner
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="manual">
                                <ManualUserSearch />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                <BarcodeScanner
                    isOpen={showScanner}
                    onScan={handleUserScan}
                    onClose={() => setShowScanner(false)}
                    scanMode="user"
                />
            </AdminLayout>
        );
    }
    // Step 2: Pilih Buku
    return (
        <AdminLayout>
            <Head title="Peminjaman Buku - Pilih Buku" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* User Info Card */}
                    <Card className="mb-6 bg-gradient-to-r from-primary to-primary-glow text-white">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-white/80 text-sm">
                                        Peminjam
                                    </p>
                                    <h2 className="text-2xl font-bold">
                                        {selectedUser?.name}
                                    </h2>
                                    <p className="text-white/80 mt-1">
                                        {selectedUser?.role_name} •
                                        {selectedUser?.student?.nis
                                            ? ` NIS: ${selectedUser.student.nis}`
                                            : ""}
                                        {selectedUser?.teacher?.nip
                                            ? ` NIP: ${selectedUser.teacher.nip}`
                                            : ""}
                                    </p>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="bg-white/20 text-white"
                                >
                                    Sisa Kuota: {selectedUser?.remaining_quota}
                                </Badge>
                            </div>
                            {selectedUser?.has_late_borrowings && (
                                <Alert
                                    variant="destructive"
                                    className="mt-4 bg-red-500/20 border-red-500"
                                >
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        User memiliki pinjaman terlambat!
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Current Borrowed Books Section */}
                    {selectedUser?.borrowed_books &&
                        selectedUser.borrowed_books.length > 0 && (
                            <Card className="mb-6 border-yellow-200 bg-yellow-50/30">
                                <CardHeader
                                    className="pb-3 cursor-pointer transition-colors"
                                    onClick={() =>
                                        setIsBorrowedBooksExpanded(
                                            !isBorrowedBooksExpanded
                                        )
                                    }
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-5 w-5 text-yellow-800" />
                                            <CardTitle className="text-lg text-yellow-800">
                                                Buku yang Sedang Dipinjam
                                            </CardTitle>
                                            <Badge
                                                variant="secondary"
                                                className="bg-yellow-200 text-yellow-800"
                                            >
                                                {
                                                    selectedUser.borrowed_books
                                                        .length
                                                }{" "}
                                                Buku
                                            </Badge>
                                        </div>
                                        <div className="text-yellow-800">
                                            {isBorrowedBooksExpanded ? (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polyline points="18 15 12 9 6 15"></polyline>
                                                </svg>
                                            ) : (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polyline points="6 9 12 15 18 9"></polyline>
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <CardDescription className="text-yellow-700">
                                        User sedang meminjam{" "}
                                        {selectedUser.borrowed_books.length}{" "}
                                        buku. Klik untuk{" "}
                                        {isBorrowedBooksExpanded
                                            ? "menyembunyikan"
                                            : "menampilkan"}{" "}
                                        detail.
                                    </CardDescription>
                                </CardHeader>

                                {isBorrowedBooksExpanded && (
                                    <CardContent>
                                        <div className="space-y-3">
                                            {selectedUser.borrowed_books.map(
                                                (borrow: any) => (
                                                    <div
                                                        key={borrow.id}
                                                        className="flex items-start justify-between p-3 bg-white rounded-lg border border-yellow-200 hover:shadow-md transition-shadow"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h4 className="font-semibold text-sm text-gray-800">
                                                                    {
                                                                        borrow
                                                                            .book
                                                                            .title
                                                                    }
                                                                </h4>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300"
                                                                >
                                                                    {borrow.status ===
                                                                    "borrowed"
                                                                        ? "Dipinjam"
                                                                        : borrow.status}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                                <p className="text-xs text-gray-600">
                                                                    Penulis:{" "}
                                                                    {
                                                                        borrow
                                                                            .book
                                                                            .author
                                                                    }
                                                                </p>
                                                                <span className="text-gray-300">
                                                                    |
                                                                </span>
                                                                <p className="text-xs text-gray-600">
                                                                    Penerbit:{" "}
                                                                    {
                                                                        borrow
                                                                            .book
                                                                            .publisher
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                                <p className="text-xs text-gray-500 font-mono">
                                                                    Barcode:{" "}
                                                                    {
                                                                        borrow
                                                                            .book_item
                                                                            .barcode
                                                                    }
                                                                </p>
                                                                <span className="text-gray-300">
                                                                    |
                                                                </span>
                                                                <p className="text-xs text-gray-500">
                                                                    Dipinjam:{" "}
                                                                    {format(
                                                                        new Date(
                                                                            borrow.borrowed_at
                                                                        ),
                                                                        "dd/MM/yyyy"
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div
                                                                className={`text-xs font-semibold ${
                                                                    new Date(
                                                                        borrow.due_date
                                                                    ) <
                                                                    new Date()
                                                                        ? "text-red-600"
                                                                        : "text-orange-600"
                                                                }`}
                                                            >
                                                                Jatuh Tempo:
                                                            </div>
                                                            <div
                                                                className={`text-sm font-bold ${
                                                                    new Date(
                                                                        borrow.due_date
                                                                    ) <
                                                                    new Date()
                                                                        ? "text-red-600"
                                                                        : "text-orange-600"
                                                                }`}
                                                            >
                                                                {format(
                                                                    new Date(
                                                                        borrow.due_date
                                                                    ),
                                                                    "dd/MM/yyyy"
                                                                )}
                                                            </div>
                                                            {new Date(
                                                                borrow.due_date
                                                            ) < new Date() && (
                                                                <Badge
                                                                    variant="destructive"
                                                                    className="mt-1 text-xs"
                                                                >
                                                                    Terlambat!
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        {/* Warning if user is at max quota */}
                                        {selectedUser.remaining_quota === 0 && (
                                            <Alert className="mt-4 bg-red-100 border-red-300">
                                                <AlertCircle className="h-4 w-4 text-red-600" />
                                                <AlertDescription className="text-red-700">
                                                    Kuota peminjaman sudah
                                                    penuh! User tidak dapat
                                                    meminjam buku lagi sampai
                                                    mengembalikan buku yang
                                                    sedang dipinjam.
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {selectedUser.remaining_quota > 0 &&
                                            selectedUser.remaining_quota <
                                                3 && (
                                                <Alert className="mt-4 bg-yellow-100 border-yellow-300">
                                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                                    <AlertDescription className="text-yellow-700">
                                                        Sisa kuota peminjaman:{" "}
                                                        {
                                                            selectedUser.remaining_quota
                                                        }{" "}
                                                        buku lagi.
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                    </CardContent>
                                )}
                            </Card>
                        )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Panel - Add Books */}
                        <div className="lg:col-span-2 space-y-4">
                            <Tabs defaultValue="scan" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger
                                        value="scan"
                                        className="flex items-center gap-2"
                                    >
                                        <QrCode className="h-4 w-4" />
                                        Scan Barcode
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="manual"
                                        className="flex items-center gap-2"
                                    >
                                        <BookOpen className="h-4 w-4" />
                                        Cari Manual
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="scan" className="mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Scan Barcode Buku
                                            </CardTitle>
                                            <CardDescription>
                                                Scan barcode pada buku yang akan
                                                dipinjam
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Button
                                                onClick={() => {
                                                    setScanMode("book");
                                                    setShowScanner(true);
                                                }}
                                                className="w-full"
                                                size="lg"
                                            >
                                                <Camera className="h-5 w-5 mr-2" />
                                                Buka Scanner
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="manual" className="mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Cari Buku Manual
                                            </CardTitle>
                                            <CardDescription>
                                                Cari buku berdasarkan judul,
                                                penulis, atau penerbit
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Button
                                                onClick={() =>
                                                    setShowBookSearch(true)
                                                }
                                                className="w-full"
                                                variant="secondary"
                                            >
                                                <Search className="h-5 w-5 mr-2" />
                                                Cari Buku
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>

                            {/* Due Date Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Tanggal Pengembalian
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) =>
                                            setDueDate(e.target.value)
                                        }
                                        min={format(new Date(), "yyyy-MM-dd")}
                                        className="max-w-xs"
                                    />
                                    <p className="text-sm text-gray-500 mt-2">
                                        * Jatuh tempo standar 7 hari dari
                                        sekarang
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Panel - Selected Books */}
                        <div>
                            <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Daftar Buku</span>
                                        <Badge variant="secondary">
                                            {selectedBooks.length} /{" "}
                                            {selectedUser?.remaining_quota}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {selectedBooks.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <BookMarked className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>Belum ada buku dipilih</p>
                                        </div>
                                    ) : (
                                        <ScrollArea className="h-[400px] pr-4">
                                            <div className="space-y-3">
                                                {selectedBooks.map((book) => (
                                                    <div
                                                        key={book.id}
                                                        className="flex items-start justify-between p-3 bg-primary-soft rounded-lg"
                                                    >
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-sm">
                                                                {
                                                                    book
                                                                        .physical_book
                                                                        .title
                                                                }
                                                            </h4>
                                                            <p className="text-xs text-gray-500">
                                                                {
                                                                    book
                                                                        .physical_book
                                                                        .author
                                                                }{" "}
                                                                • {book.barcode}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleRemoveBook(
                                                                    book.id
                                                                )
                                                            }
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    )}

                                    <Separator className="my-4" />

                                    <div className="space-y-2">
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={
                                                selectedBooks.length === 0 ||
                                                loading ||
                                                selectedUser?.has_late_borrowings
                                            }
                                            className="w-full bg-primary hover:bg-primary/90"
                                        >
                                            {loading ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                            )}
                                            Proses Peminjaman
                                        </Button>
                                        <Button
                                            onClick={resetBorrowing}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            Ganti User
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* FIX: Pass isOpen prop */}
            <BarcodeScanner
                isOpen={showScanner}
                onScan={handleBookScan}
                onClose={() => setShowScanner(false)}
                scanMode="book"
            />

            {showBookSearch && selectedUser && (
                <BookSearchManual
                    onSelectBookItem={handleAddBookManual}
                    selectedBookItemIds={selectedBooks.map((b) => b.id)}
                    onClose={() => setShowBookSearch(false)}
                />
            )}
        </AdminLayout>
    );
}
