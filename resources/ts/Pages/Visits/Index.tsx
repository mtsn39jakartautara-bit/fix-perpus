// resources/js/Pages/Visits/Index.tsx
import { QRCodeSVG } from "qrcode.react";
import { AppShell } from "@/Layouts/AppShell";
import { VisitPageProps, Visit } from "@/types/visit";
import { useState, useRef, useEffect } from "react";
import { motion, PanInfo } from "framer-motion";
import {
    QrCode,
    User,
    History,
    ChevronUp,
    Camera,
    CheckCircle,
    XCircle,
    Clock,
    MapPin,
    Award,
    UserCheck,
    Download,
    Share2,
    X,
    BookOpen,
    BookMarked,
} from "lucide-react";
import { Head, router, useForm } from "@inertiajs/react";
import QrScanner from "qr-scanner";
import { Button } from "@/Components/ui/button";

export default function VisitsIndex({
    activities,
    userBarcode,
    userBarcodeHtml,
    userName,
    userPoints,
}: VisitPageProps) {
    const [scanMode, setScanMode] = useState<"checkpoint" | "user">(
        "checkpoint"
    );
    const [showActivityDrawer, setShowActivityDrawer] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);
    const [localActivities, setLocalActivities] = useState<Visit[]>(activities);
    const [isLoading, setIsLoading] = useState(false);
    const [barcodeImage, setBarcodeImage] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerRef = useRef<QrScanner | null>(null);
    const drawerRef = useRef<HTMLDivElement>(null);
    const dragStartY = useRef(0);

    // Convert HTML barcode to image for better display
    useEffect(() => {
        if (userBarcodeHtml) {
            // Create a temporary div to get the SVG/HTML content
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = userBarcodeHtml;
            const barcodeElement = tempDiv.firstChild as HTMLElement;

            if (barcodeElement) {
                // If it's SVG, convert to string
                if (barcodeElement.tagName === "svg") {
                    const svgString = new XMLSerializer().serializeToString(
                        barcodeElement
                    );
                    const blob = new Blob([svgString], {
                        type: "image/svg+xml",
                    });
                    const url = URL.createObjectURL(blob);
                    setBarcodeImage(url);
                } else {
                    // If it's other HTML element, set as is
                    setBarcodeImage(userBarcodeHtml);
                }
            }
        }
    }, [userBarcodeHtml]);

    // Initialize QR Scanner
    useEffect(() => {
        if (scanMode === "checkpoint" && scanning && videoRef.current) {
            scannerRef.current = new QrScanner(
                videoRef.current,
                (result) => {
                    console.log("Scan result:", result.data);
                    handleScan(result.data);
                },
                {
                    onDecodeError: (error) => {
                        console.log("Scan error:", error);
                    },
                    preferredCamera: "environment",
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                }
            );

            scannerRef.current.start().catch((err) => {
                console.error("Failed to start scanner:", err);
                setScanResult({
                    success: false,
                    message:
                        "Tidak dapat mengakses kamera. Periksa izin kamera.",
                });
                setScanning(false);
            });

            return () => {
                scannerRef.current?.stop();
                scannerRef.current?.destroy();
            };
        }
    }, [scanMode, scanning]);

    const handleScan = async (barcode: string) => {
        if (isLoading) return;

        setIsLoading(true);
        scannerRef.current?.stop();

        router.post(
            route("visits.scan"),
            { barcode },
            {
                preserveScroll: true,
                preserveState: true,

                onSuccess: () => {
                    setScanResult({
                        success: true,
                        message: "Kunjungan berhasil!",
                    });

                    setTimeout(() => {
                        setScanResult(null);
                        setScanning(false);
                    }, 3000);
                },

                onError: (error: any) => {
                    setScanResult({
                        success: false,
                        message:
                            error.message ||
                            "Terjadi kesalahan. Silakan coba lagi.",
                    });

                    setTimeout(() => {
                        setScanResult(null);
                        setScanning(false);
                    }, 3000);
                },

                onFinish: () => {
                    setIsLoading(false);
                },
            }
        );
    };

    const startScanning = () => {
        setScanning(true);
        setScanResult(null);
    };

    const stopScanning = () => {
        scannerRef.current?.stop();
        setScanning(false);
    };

    // Handle drag untuk drawer
    const handleDragStart = (event: any, info: PanInfo) => {
        dragStartY.current = info.point.y;
        setDragging(true);
    };

    const handleDragEnd = (event: any, info: PanInfo) => {
        setDragging(false);
        const dragDistance = info.offset.y;

        if (dragDistance > 100) {
            setShowActivityDrawer(false);
        } else if (dragDistance < -50) {
            setShowActivityDrawer(true);
        }
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - d.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Hari ini";
        if (diffDays === 1) return "Kemarin";
        return d.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const downloadBarcode = () => {
        if (barcodeImage && barcodeImage.startsWith("blob:")) {
            const link = document.createElement("a");
            link.href = barcodeImage;
            link.download = `barcode-${userName}.png`;
            link.click();
        } else if (userBarcodeHtml) {
            // Create canvas from HTML element
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = userBarcodeHtml;
            const barcodeElement = tempDiv.firstChild as HTMLElement;

            if (barcodeElement && barcodeElement.tagName === "svg") {
                const svgString = new XMLSerializer().serializeToString(
                    barcodeElement
                );
                const blob = new Blob([svgString], { type: "image/svg+xml" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `barcode-${userName}.svg`;
                link.click();
                URL.revokeObjectURL(url);
            }
        }
    };

    const shareBarcode = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Barcode Perpustakaan",
                    text: `Barcode perpustakaan untuk ${userName}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log("Error sharing:", error);
            }
        } else {
            // Fallback - copy barcode text
            if (userBarcode) {
                navigator.clipboard.writeText(userBarcode);
                alert("Barcode telah disalin ke clipboard!");
            }
        }
    };

    // Helper functions for activity types
    const getActivityIcon = (type: string, size: "sm" | "md" = "md") => {
        const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
        const iconProps = { className: iconSize };

        switch (type) {
            case "visit_offline":
                return <MapPin {...iconProps} />;
            case "visit_online":
                return <UserCheck {...iconProps} />;
            case "borrow_book":
                return <BookOpen {...iconProps} />;
            case "return_book":
                return <BookMarked {...iconProps} />;
            default:
                return <History {...iconProps} />;
        }
    };

    const getActivityLabel = (type: string) => {
        switch (type) {
            case "visit_offline":
                return "Kunjungan Offline";
            case "visit_online":
                return "Kunjungan Online";
            case "borrow_book":
                return "Peminjaman Buku";
            case "return_book":
                return "Pengembalian Buku";
            default:
                return "Aktivitas";
        }
    };

    const getActivityBgColor = (type: string) => {
        switch (type) {
            case "visit_offline":
                return "bg-green-100";
            case "visit_online":
                return "bg-blue-100";
            case "borrow_book":
                return "bg-yellow-100";
            case "return_book":
                return "bg-purple-100";
            default:
                return "bg-gray-100";
        }
    };

    const getActivityPoints = (type: string) => {
        switch (type) {
            case "visit_offline":
                return "+10";
            case "visit_online":
                return "+5";
            case "borrow_book":
                return "+15";
            case "return_book":
                return "+5";
            default:
                return "+0";
        }
    };
    // Group activities by date
    const groupedActivities = localActivities.reduce((groups, activity) => {
        const date = formatDate(activity.created_at);
        if (!groups[date]) {
            groups[date] = [];
        }
        (groups[date] ??= []).push(activity);
        return groups;
    }, {} as Record<string, Visit[]>);

    return (
        <>
            <Head title="Kunjungan Perpustakaan" />

            <AppShell>
                <div className="mx-auto max-w-2xl px-5 pt-8 pb-24 lg:px-10 lg:pt-10">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            Kunjungan Perpustakaan
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Scan untuk mengumpulkan poin
                        </p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="mb-6 rounded-2xl bg-card p-1 shadow-soft">
                        <div className="flex gap-1">
                            <button
                                onClick={() => setScanMode("checkpoint")}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-medium transition-all ${
                                    scanMode === "checkpoint"
                                        ? "bg-gradient-primary text-primary-foreground shadow-md"
                                        : "text-muted-foreground hover:bg-muted"
                                }`}
                            >
                                <QrCode className="h-5 w-5" />
                                <span>Scan Checkpoint</span>
                            </button>
                            <button
                                onClick={() => setScanMode("user")}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-medium transition-all ${
                                    scanMode === "user"
                                        ? "bg-gradient-primary text-primary-foreground shadow-md"
                                        : "text-muted-foreground hover:bg-muted"
                                }`}
                            >
                                <User className="h-5 w-5" />
                                <span>Barcode Saya</span>
                            </button>
                        </div>
                    </div>

                    {/* Content based on mode */}
                    <motion.div
                        key={scanMode}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden rounded-3xl bg-card shadow-soft"
                    >
                        {scanMode === "checkpoint" ? (
                            <div className="p-6">
                                {!scanning ? (
                                    <div className="text-center">
                                        <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
                                            <Camera className="h-12 w-12 text-primary" />
                                        </div>
                                        <h3 className="mb-2 text-xl font-semibold">
                                            Scan Barcode Checkpoint
                                        </h3>
                                        <p className="mb-6 text-sm text-muted-foreground">
                                            Arahkan kamera ke barcode yang
                                            tersedia di area perpustakaan
                                        </p>
                                        <Button
                                            onClick={startScanning}
                                            className="w-full rounded-xl bg-gradient-primary text-primary-foreground shadow-md hover:shadow-lg"
                                        >
                                            Buka Kamera
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <video
                                            ref={videoRef}
                                            className="aspect-square w-full rounded-xl object-cover"
                                            style={{ transform: "scaleX(-1)" }}
                                        />
                                        <button
                                            onClick={stopScanning}
                                            className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                                        >
                                            <XCircle className="h-5 w-5" />
                                        </button>
                                        {scanResult && (
                                            <div
                                                className={`absolute inset-0 flex items-center justify-center rounded-xl ${
                                                    scanResult.success
                                                        ? "bg-green-500/90"
                                                        : "bg-red-500/90"
                                                }`}
                                            >
                                                <div className="p-6 text-center text-white">
                                                    {scanResult.success ? (
                                                        <CheckCircle className="mx-auto mb-4 h-16 w-16" />
                                                    ) : (
                                                        <XCircle className="mx-auto mb-4 h-16 w-16" />
                                                    )}
                                                    <p className="text-lg font-medium">
                                                        {scanResult.message}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {isLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
                                                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-white"></div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-6 text-center">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                                    <Award className="h-5 w-5 text-primary" />
                                    <span className="font-medium text-primary">
                                        {userPoints} Poin
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <p className="mb-2 text-sm text-muted-foreground">
                                        Barcode Pengguna
                                    </p>
                                    <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-8">
                                        {userBarcode ? (
                                            <>
                                                {/* Display QR Code */}

                                                <div className="flex items-center justify-center">
                                                    <QRCodeSVG
                                                        value={userBarcode}
                                                        size={220}
                                                        level="H"
                                                        imageSettings={{
                                                            src: "/assets/images/logo.webp",
                                                            height: 60,
                                                            width: 60,
                                                            excavate: true,
                                                        }}
                                                    />
                                                </div>
                                                <div className="my-2 inline-block rounded-lg bg-muted px-4 py-2 font-mono text-sm font-bold tracking-wider">
                                                    {userBarcode}
                                                </div>
                                                <div className="mt-2 text-sm text-muted-foreground">
                                                    {userName}
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="mt-6 flex gap-3">
                                                    <Button
                                                        onClick={
                                                            downloadBarcode
                                                        }
                                                        className="flex-1 gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                        <span className="text-sm">
                                                            Download
                                                        </span>
                                                    </Button>
                                                    <Button
                                                        onClick={shareBarcode}
                                                        className="flex-1 gap-2 rounded-lg bg-primary/80 text-primary-foreground hover:bg-primary/70"
                                                    >
                                                        <Share2 className="h-4 w-4" />
                                                        <span className="text-sm">
                                                            Bagikan
                                                        </span>
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-muted-foreground">
                                                <User className="mx-auto mb-2 h-16 w-16" />
                                                <p>Belum memiliki barcode</p>
                                                <p className="mt-2 text-xs">
                                                    Hubungi admin untuk membuat
                                                    barcode
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                                    <p className="mb-1 font-medium">
                                        📌 Cara Penggunaan:
                                    </p>
                                    <p>
                                        Tunjukkan QR Code ini ke petugas
                                        perpustakaan untuk melakukan kunjungan
                                        offline
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* User Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 rounded-2xl bg-card p-4 shadow-soft"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Selamat datang,
                                </p>
                                <p className="text-lg font-semibold">
                                    {userName}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">
                                    Total Poin
                                </p>
                                <p className="user-points bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-2xl font-bold text-transparent">
                                    {userPoints}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Activity Drawer */}
                <motion.div
                    ref={drawerRef}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={{ top: 0, bottom: 0.5 }}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    animate={{
                        y: showActivityDrawer ? 0 : "calc(100% - 200px)",
                    }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-card shadow-2xl lg:hidden"
                >
                    {/* Drag Handle */}
                    <div className="relative flex justify-center pt-4 pb-3">
                        <div className="h-1.5 w-12 rounded-full bg-border" />
                        <div className="absolute right-4 top-4">
                            <div className="text-xs font-medium text-muted-foreground">
                                {showActivityDrawer ? "Tutup ↓" : "Tarik ↑"}
                            </div>
                        </div>
                    </div>

                    {/* Drawer Header */}
                    <div
                        className={`border-b border-border px-6 pb-4 transition-all duration-300 ${
                            !showActivityDrawer ? "opacity-100" : ""
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
                                <History className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Aktivitas Terbaru
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Riwayat kunjungan Anda
                                </p>
                            </div>
                            <div className="ml-auto rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                                {localActivities.length}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Preview - Show when drawer is minimized */}
                    {!showActivityDrawer && localActivities.length > 0 && (
                        <div className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-card px-6 py-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                                    {getActivityIcon(
                                        localActivities[0]?.type,
                                        "sm"
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        Aktivitas Terakhir:{" "}
                                        {getActivityLabel(
                                            localActivities[0]?.type
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {localActivities[0]?.time}
                                    </p>
                                </div>
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    )}

                    {/* Activity List */}
                    <div
                        className={`overflow-y-auto transition-all duration-300 ${
                            showActivityDrawer
                                ? "max-h-[calc(100vh-250px)]"
                                : "max-h-[300px]"
                        }`}
                    >
                        {Object.entries(groupedActivities).length > 0 ? (
                            Object.entries(groupedActivities).map(
                                ([date, items]) => (
                                    <div
                                        key={date}
                                        className="border-b border-border/50"
                                    >
                                        <div className="sticky top-0 bg-card/95 px-6 py-2 backdrop-blur-sm">
                                            <span className="text-xs font-medium text-muted-foreground">
                                                {date}
                                            </span>
                                        </div>
                                        {items.map((activity, index) => (
                                            <motion.div
                                                key={activity.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: index * 0.05,
                                                }}
                                                className="px-6 py-4 transition-colors hover:bg-muted/30"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${getActivityBgColor(
                                                            activity.type
                                                        )}`}
                                                    >
                                                        {getActivityIcon(
                                                            activity.type,
                                                            "md"
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">
                                                            {getActivityLabel(
                                                                activity.type
                                                            )}
                                                        </p>
                                                        {activity.user_name && (
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                {
                                                                    activity.user_name
                                                                }
                                                            </p>
                                                        )}
                                                        {activity.point_period_name && (
                                                            <p className="text-xs text-muted-foreground/60 mt-0.5">
                                                                Periode:{" "}
                                                                {
                                                                    activity.point_period_name
                                                                }
                                                            </p>
                                                        )}
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-xs text-muted-foreground">
                                                                {activity.time}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-1 text-green-600">
                                                            <Award className="h-4 w-4" />
                                                            <span className="text-sm font-medium">
                                                                {getActivityPoints(
                                                                    activity.type
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )
                            )
                        ) : (
                            <div className="py-12 text-center">
                                <History className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                                <p className="text-muted-foreground">
                                    Belum ada aktivitas
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground/60">
                                    Lakukan aktivitas pertama Anda!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pull to see more indicator */}
                    {!showActivityDrawer && (
                        <div className="absolute left-1/2 top-2 flex -translate-x-1/2 flex-col items-center gap-1">
                            <ChevronUp className="h-5 w-5 animate-bounce text-muted-foreground" />
                        </div>
                    )}

                    {/* Gradient overlay when minimized */}
                    {!showActivityDrawer && localActivities.length > 3 && (
                        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
                    )}
                </motion.div>
            </AppShell>
        </>
    );
}
