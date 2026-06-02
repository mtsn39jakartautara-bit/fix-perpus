// resources/js/Pages/Admin/Returns/Index.tsx

import React, { useState, useRef, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
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
import { Badge } from "@/Components/ui/badge";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Separator } from "@/Components/ui/separator";
import { Checkbox } from "@/Components/ui/checkbox";
import {
    QrCode,
    Search,
    UserPlus,
    CheckCircle,
    AlertCircle,
    X,
    Calendar,
    User as UserIcon,
    BookOpen,
    BookMarked,
    Loader2,
    Camera,
    ArrowLeft,
    DollarSign,
    Clock,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { UserReturn, BorrowedBookReturn } from "@/types/return-admin";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { AdminLayout } from "@/Layouts/AppShellAdmin";
import QrScanner from "qr-scanner";
import debounce from "lodash/debounce";

// Komponen Scanner Barcode
const BarcodeScanner = ({
    onScan,
    onClose,
    isOpen,
}: {
    onScan: (result: string) => void;
    onClose: () => void;
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
        if (!isOpen || !scanning) return;

        let cancelled = false;

        const startCamera = async () => {
            try {
                await new Promise((resolve) => setTimeout(resolve, 300));
                if (cancelled) return;

                const video = videoRef.current;
                if (!video) return;

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
            } catch (error) {
                console.error(error);
                setScanResult({
                    success: false,
                    message: "Tidak dapat mengakses kamera.",
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
        setScanResult({ success: true, message: "User ditemukan!" });
        setScanning(false);
        setTimeout(() => onClose(), 1500);
    };

    const stopScanning = () => {
        scannerRef.current?.stop();
        setScanning(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && stopScanning()}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Scan Barcode User</DialogTitle>
                    <DialogDescription>
                        Arahkan kamera ke barcode user
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {!scanning ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Camera className="h-20 w-20 text-primary" />
                            <Button
                                className="mt-4"
                                onClick={() => setScanning(true)}
                            >
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
                                    <X className="w-4 h-4 mr-2" /> Tutup Kamera
                                </Button>
                            </div>
                            <Separator />
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleScan(manualBarcode);
                                }}
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

// Komponen Utama
export default function ReturnIndex() {
    const [activeTab, setActiveTab] = useState<"scan" | "manual">("scan");
    const [selectedUser, setSelectedUser] = useState<UserReturn | null>(null);
    const [selectedBorrowings, setSelectedBorrowings] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleUserScan = async (barcode: string) => {
        try {
            const response = await axios.get("/admin/returns/find-user", {
                params: { search: barcode },
            });
            if (response.data.success) {
                setSelectedUser(response.data.user);
                setSelectedBorrowings([]);
                toast.success(`User ditemukan: ${response.data.user.name}`);
                setShowScanner(false);
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "User tidak ditemukan"
            );
        }
    };

    const handleSelectBorrowing = (borrowingId: number) => {
        setSelectedBorrowings((prev) =>
            prev.includes(borrowingId)
                ? prev.filter((id) => id !== borrowingId)
                : [...prev, borrowingId]
        );
    };

    const handleSelectAll = () => {
        if (
            selectedUser &&
            selectedBorrowings.length === selectedUser.borrowed_books.length
        ) {
            setSelectedBorrowings([]);
        } else if (selectedUser) {
            setSelectedBorrowings(selectedUser.borrowed_books.map((b) => b.id));
        }
    };

    const handleProcessReturn = async () => {
        if (!selectedUser || selectedBorrowings.length === 0) {
            toast.error("Pilih minimal 1 buku yang akan dikembalikan");
            return;
        }

        setSubmitting(true);
        try {
            const response = await axios.post("/admin/returns/process", {
                borrowing_ids: selectedBorrowings,
            });

            if (response.data.success) {
                const totalFine = response.data.total_fine;
                let message = `Berhasil mengembalikan ${selectedBorrowings.length} buku`;
                if (totalFine > 0) {
                    message += ` dengan denda Rp ${totalFine.toLocaleString(
                        "id-ID"
                    )}`;
                }
                toast.success(message);

                // Reset state
                setSelectedUser(null);
                setSelectedBorrowings([]);
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Gagal memproses pengembalian"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const resetReturn = () => {
        setSelectedUser(null);
        setSelectedBorrowings([]);
    };

    // Form pencarian manual user
    const ManualUserSearch = () => {
        const [searchValue, setSearchValue] = useState("");
        const [isSearching, setIsSearching] = useState(false);
        const [searchResults, setSearchResults] = useState<UserReturn[]>([]);
        const [showResults, setShowResults] = useState(false);

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
                        "/admin/returns/search-users",
                        {
                            params: { search: query },
                        }
                    );
                    if (response.data.success && response.data.users) {
                        setSearchResults(response.data.users);
                        setShowResults(true);
                    }
                } catch (error) {
                    console.error("Search error:", error);
                } finally {
                    setIsSearching(false);
                }
            }, 500)
        ).current;

        useEffect(() => {
            debouncedSearch(searchValue);
            return () => debouncedSearch.cancel();
        }, [searchValue, debouncedSearch]);

        const handleSelectUser = (user: UserReturn) => {
            setSelectedUser(user);
            setSelectedBorrowings([]);
            toast.success(`User ditemukan: ${user.name}`);
            setSearchValue("");
            setSearchResults([]);
            setShowResults(false);
        };

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5" />
                        Cari User
                    </CardTitle>
                    <CardDescription>
                        Cari berdasarkan NIS, NIP, Email, atau Nama
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                        )}
                    </div>

                    {showResults && searchValue.length >= 2 && (
                        <div className="relative mt-2">
                            <div className="absolute z-10 w-full bg-popover rounded-md border shadow-md">
                                <div className="max-h-80 overflow-y-auto">
                                    {searchResults.length === 0 &&
                                    !isSearching ? (
                                        <div className="py-8 text-center">
                                            <p className="text-sm text-muted-foreground">
                                                User tidak ditemukan
                                            </p>
                                        </div>
                                    ) : (
                                        searchResults.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer border-b"
                                                onClick={() =>
                                                    handleSelectUser(user)
                                                }
                                            >
                                                <div>
                                                    <p className="font-semibold">
                                                        {user.name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="secondary">
                                                            {user.role_name}
                                                        </Badge>
                                                        {user.nis && (
                                                            <span className="text-xs">
                                                                NIS: {user.nis}
                                                            </span>
                                                        )}
                                                        {user.nip && (
                                                            <span className="text-xs">
                                                                NIP: {user.nip}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {user.email}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={
                                                        user.total_borrowed > 0
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                >
                                                    {user.total_borrowed} Buku
                                                </Badge>
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

    // Step 1: Pilih User
    if (!selectedUser) {
        return (
            <AdminLayout>
                <Head title="Pengembalian Buku" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                Pengembalian Buku
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Pilih metode pengembalian buku
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
                                    <QrCode className="h-4 w-4" /> Scan Barcode
                                </TabsTrigger>
                                <TabsTrigger value="manual" className="gap-2">
                                    <UserPlus className="h-4 w-4" /> Manual
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="scan">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Scan Barcode User</CardTitle>
                                        <CardDescription>
                                            Scan barcode kartu anggota
                                            perpustakaan
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button
                                            onClick={() => setShowScanner(true)}
                                            className="w-full"
                                            size="lg"
                                        >
                                            <Camera className="h-5 w-5 mr-2" />{" "}
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
                />
            </AdminLayout>
        );
    }

    // Step 2: Pilih Buku yang akan dikembalikan
    return (
        <AdminLayout>
            <Head title="Pengembalian Buku - Pilih Buku" />
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
                                        {selectedUser.name}
                                    </h2>
                                    <p className="text-white/80 mt-1">
                                        {selectedUser.role_name} •
                                        {selectedUser.nis
                                            ? ` NIS: ${selectedUser.nis}`
                                            : ""}
                                        {selectedUser.nip
                                            ? ` NIP: ${selectedUser.nip}`
                                            : ""}
                                    </p>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="bg-white/20 text-white"
                                >
                                    Total Dipinjam:{" "}
                                    {selectedUser.total_borrowed}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Borrowed Books Selection */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Buku yang Akan Dikembalikan
                                </CardTitle>
                                {selectedUser.borrowed_books.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSelectAll}
                                    >
                                        {selectedBorrowings.length ===
                                        selectedUser.borrowed_books.length
                                            ? "Batal Pilih Semua"
                                            : "Pilih Semua"}
                                    </Button>
                                )}
                            </div>
                            <CardDescription>
                                Pilih buku yang akan dikembalikan oleh user
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {selectedUser.borrowed_books.length === 0 ? (
                                <div className="text-center py-12">
                                    <BookMarked className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-gray-500">
                                        User tidak memiliki buku yang dipinjam
                                    </p>
                                    <Button
                                        onClick={resetReturn}
                                        variant="outline"
                                        className="mt-4"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />{" "}
                                        Kembali
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        {selectedUser.borrowed_books.map(
                                            (borrow) => (
                                                <div
                                                    key={borrow.id}
                                                    className={`flex items-start justify-between p-4 rounded-lg border transition-colors cursor-pointer ${
                                                        selectedBorrowings.includes(
                                                            borrow.id
                                                        )
                                                            ? "bg-primary/5 border-primary"
                                                            : "hover:bg-muted/50"
                                                    }`}
                                                    onClick={() =>
                                                        handleSelectBorrowing(
                                                            borrow.id
                                                        )
                                                    }
                                                >
                                                    <div className="flex items-start gap-3 flex-1">
                                                        <Checkbox
                                                            checked={selectedBorrowings.includes(
                                                                borrow.id
                                                            )}
                                                            onCheckedChange={() =>
                                                                handleSelectBorrowing(
                                                                    borrow.id
                                                                )
                                                            }
                                                            className="mt-1"
                                                        />
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold">
                                                                {
                                                                    borrow.book
                                                                        .title
                                                                }
                                                            </h4>
                                                            <p className="text-sm text-gray-600">
                                                                Penulis:{" "}
                                                                {
                                                                    borrow.book
                                                                        .author
                                                                }
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                                <span className="font-mono">
                                                                    Barcode:{" "}
                                                                    {
                                                                        borrow
                                                                            .book_item
                                                                            .barcode
                                                                    }
                                                                </span>
                                                                <span>•</span>
                                                                <span>
                                                                    Dipinjam:{" "}
                                                                    {format(
                                                                        new Date(
                                                                            borrow.borrowed_at
                                                                        ),
                                                                        "dd/MM/yyyy"
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div
                                                            className={`text-sm font-semibold ${
                                                                borrow.is_late
                                                                    ? "text-red-600"
                                                                    : "text-green-600"
                                                            }`}
                                                        >
                                                            Jatuh Tempo:{" "}
                                                            {format(
                                                                new Date(
                                                                    borrow.due_date
                                                                ),
                                                                "dd/MM/yyyy"
                                                            )}
                                                        </div>
                                                        {borrow.is_late && (
                                                            <div className="flex items-center gap-1 mt-1 text-red-600">
                                                                <Clock className="h-3 w-3" />
                                                                <span className="text-xs">
                                                                    Terlambat{" "}
                                                                    {
                                                                        borrow.days_late
                                                                    }{" "}
                                                                    hari
                                                                </span>
                                                            </div>
                                                        )}
                                                        {borrow.fine > 0 && (
                                                            <div className="flex items-center gap-1 mt-1 text-orange-600">
                                                                <DollarSign className="h-3 w-3" />
                                                                <span className="text-xs font-semibold">
                                                                    Denda: Rp{" "}
                                                                    {borrow.fine.toLocaleString(
                                                                        "id-ID"
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <Separator className="my-6" />

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="font-semibold">
                                                Total Buku Dikembalikan:
                                            </span>
                                            <Badge
                                                variant="secondary"
                                                className="text-lg"
                                            >
                                                {selectedBorrowings.length} /{" "}
                                                {
                                                    selectedUser.borrowed_books
                                                        .length
                                                }
                                            </Badge>
                                        </div>

                                        {selectedBorrowings.length > 0 && (
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={
                                                        handleProcessReturn
                                                    }
                                                    disabled={submitting}
                                                    className="flex-1"
                                                >
                                                    {submitting ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    ) : (
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                    )}
                                                    Proses Pengembalian
                                                </Button>
                                                <Button
                                                    onClick={resetReturn}
                                                    variant="outline"
                                                >
                                                    Ganti User
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}

// Import Dialog components yang belum di-import
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
