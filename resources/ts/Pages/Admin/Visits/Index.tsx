// pages/admin/visits/index.tsx
import { useState, useEffect, useRef } from "react";
import { router, usePage } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    QrCode,
    UserPlus,
    Camera,
    X,
    Search,
    UserCheck,
    Calendar,
    Clock,
    Award,
    Users,
    CheckCircle,
    AlertCircle,
    Loader2,
    User,
    Mail,
    Hash,
    Building2,
    GraduationCap,
    ListChecks,
    Trash2,
} from "lucide-react";
import QrScanner from "qr-scanner";
import { AdminLayout } from "@/Layouts/AppShellAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Badge } from "@/Components/ui/badge";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Checkbox } from "@/Components/ui/checkbox";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import debounce from "lodash/debounce";
import { createPortal } from "react-dom";

interface UserData {
    id: number;
    name: string;
    email: string;
    role: string;
    class?: string;
    nis?: string;
    nisn?: string;
    nip?: string;
    avatar?: string;
    total_points: number;
}

interface VisitData {
    id: number;
    user: UserData;
    created_at: string;
    type: string;
}

interface Props {
    todayVisits: VisitData[];
    recentVisits: VisitData[];
    todayCount: number;
    totalPointsToday: number;
}

interface BatchResult {
    success: UserData[];
    failed: Array<{
        user: UserData;
        reason: string;
    }>;
}

export default function AdminVisits({
    todayVisits,
    recentVisits,
    todayCount,
    totalPointsToday,
}: Props) {
    const [activeTab, setActiveTab] = useState<"scan" | "manual">("scan");
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<UserData[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<UserData[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
    const [showResultDialog, setShowResultDialog] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerRef = useRef<QrScanner | null>(null);

    // Debounced search function
    const debouncedSearch = useRef(
        debounce(async (query: string) => {
            if (!query.trim() || query.length < 2) {
                setSearchResults([]);
                setSearching(false);
                return;
            }

            setSearching(true);

            try {
                const response = await fetch(
                    route("admin.visits.search", { q: query })
                );

                const data = await response.json();
                setSearchResults(data.users || []);
            } catch (error) {
                console.error("Search error:", error);
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 500)
    ).current;

    useEffect(() => {
        debouncedSearch(searchQuery);
        return () => debouncedSearch.cancel();
    }, [searchQuery, debouncedSearch]);

    // Initialize QR Scanner
    useEffect(() => {
        if (activeTab === "scan" && scanning && videoRef.current) {
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
                setTimeout(() => {
                    setScanning(false);
                    setScanResult(null);
                }, 3000);
            });

            return () => {
                scannerRef.current?.stop();
                scannerRef.current?.destroy();
            };
        }
    }, [activeTab, scanning]);

    const handleScan = async (barcode: string) => {
        if (isLoading) return;

        setIsLoading(true);
        scannerRef.current?.stop();

        router.post(
            route("admin.visits.scan"),
            { barcode },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page: any) => {
                    const flash = page.props.flash;
                    const successMessage =
                        flash?.success || "Kunjungan berhasil dicatat!";

                    setScanResult({
                        success: true,
                        message: successMessage,
                    });

                    setTimeout(() => {
                        setScanResult(null);
                        setScanning(false);
                    }, 3000);
                },
                onError: (errors: any) => {
                    let errorMessage = "Terjadi kesalahan. Silakan coba lagi.";

                    if (errors?.message) {
                        errorMessage = errors?.message;
                    }

                    setScanResult({
                        success: false,
                        message: errorMessage,
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
        setScanResult(null);
    };

    const toggleUserSelection = (user: UserData) => {
        setSelectedUsers((prev) => {
            const isSelected = prev.some((u) => u.id === user.id);
            if (isSelected) {
                return prev.filter((u) => u.id !== user.id);
            } else {
                return [...prev, user];
            }
        });
    };

    const removeSelectedUser = (userId: number) => {
        setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
    };

    const clearSelectedUsers = () => {
        setSelectedUsers([]);
    };

    const handleBatchSubmit = async () => {
        if (selectedUsers.length === 0) return;

        setSubmitting(true);
        setBatchResult(null);

        router.post(
            route("admin.visits.batch"),
            { user_ids: selectedUsers.map((u) => u.id) },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page: any) => {
                    const result = page.props.batchResult;
                    if (result) {
                        setBatchResult(result);
                        setShowResultDialog(true);

                        // Clear successful users from selection
                        const failedUserIds = result.failed.map(
                            (f: any) => f.user.id
                        );
                        const remainingUsers = selectedUsers.filter((u) =>
                            failedUserIds.includes(u.id)
                        );
                        setSelectedUsers(remainingUsers);

                        // Refresh data
                        router.reload({
                            only: [
                                "todayVisits",
                                "recentVisits",
                                "todayCount",
                                "totalPointsToday",
                            ],
                        });
                    } else {
                        // If all success, clear selection
                        setSelectedUsers([]);
                        setSearchQuery("");
                        setSearchResults([]);
                    }
                },
                onError: (errors: any) => {
                    let errorMessage = "Terjadi kesalahan";
                    if (errors?.message) {
                        errorMessage = errors?.message;
                    }
                    alert(errorMessage);
                },
                onFinish: () => {
                    setSubmitting(false);
                },
            }
        );
    };

    const getUserInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getUserRoleBadge = (role: string) => {
        const roleMap: Record<
            string,
            {
                label: string;
                variant: "default" | "secondary" | "destructive" | "outline";
            }
        > = {
            student: { label: "Siswa", variant: "default" },
            teacher: { label: "Guru", variant: "secondary" },
            admin: { label: "Admin", variant: "destructive" },
            external: { label: "Eksternal", variant: "outline" },
        };

        const config = roleMap[role] || { label: role, variant: "outline" };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getUserDetail = (user: UserData) => {
        if (user.role === "student") {
            return `${user.class || "Kelas tidak tersedia"} • ${
                user.nisn || user.nis || "NIS tidak tersedia"
            }`;
        } else if (user.role === "teacher") {
            return `NIP: ${user.nip || "Tidak tersedia"}`;
        }
        return user.email;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            Manajemen Kunjungan
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Catat kunjungan siswa, guru, atau pengunjung
                            perpustakaan
                        </p>
                    </div>

                    {/* Stat Cards */}
                    <div className="flex gap-3">
                        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/20">
                                        <Users className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {todayCount}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Kunjungan Hari Ini
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-500/20">
                                        <Award className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {totalPointsToday}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Total Poin Terbagikan
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Main Content */}
                <Tabs
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as "scan" | "manual")}
                    className="space-y-6"
                >
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="scan" className="gap-2">
                            <Camera className="h-4 w-4" />
                            Scan Barcode
                        </TabsTrigger>
                        <TabsTrigger value="manual" className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            Input Manual
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab Scan Barcode */}
                    <TabsContent value="scan" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <QrCode className="h-5 w-5" />
                                    Scan Barcode Pengguna
                                </CardTitle>
                                <CardDescription>
                                    Arahkan kamera ke barcode yang dimiliki
                                    siswa/guru untuk mencatat kunjungan
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!scanning ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/70 rounded-full blur-2xl opacity-20 animate-pulse" />
                                            <Camera className="h-24 w-24 text-primary relative" />
                                        </div>
                                        <h3 className="mt-6 text-lg font-semibold">
                                            Siap Memindai Barcode
                                        </h3>
                                        <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                                            Klik tombol di bawah untuk membuka
                                            kamera dan mulai memindai barcode
                                            pengguna
                                        </p>
                                        <Button
                                            onClick={startScanning}
                                            className="mt-6 gap-2"
                                        >
                                            <Camera className="h-4 w-4" />
                                            Buka Kamera
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                                            <video
                                                ref={videoRef}
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Scan region overlay */}
                                            <div className="absolute inset-0 border-2 border-primary/50 rounded-lg pointer-events-none" />
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 border-2 border-primary rounded-lg">
                                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                                                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                                            </div>

                                            {/* Message overlay di tengah camera */}
                                            <AnimatePresence>
                                                {scanResult && (
                                                    <motion.div
                                                        initial={{
                                                            opacity: 0,
                                                            scale: 0.9,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            scale: 1,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            scale: 0.9,
                                                        }}
                                                        className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-10"
                                                    >
                                                        <div
                                                            className={`text-center p-6 rounded-xl max-w-xs mx-4 ${
                                                                scanResult.success
                                                                    ? "bg-green-500"
                                                                    : "bg-red-500"
                                                            }`}
                                                        >
                                                            <div className="flex flex-col items-center gap-3">
                                                                {scanResult.success ? (
                                                                    <CheckCircle className="h-12 w-12 text-white" />
                                                                ) : (
                                                                    <AlertCircle className="h-12 w-12 text-white" />
                                                                )}
                                                                <p className="text-white font-medium text-center">
                                                                    {
                                                                        scanResult.message
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Loading overlay */}
                                            {isLoading && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                                                    <div className="text-center">
                                                        <Loader2 className="h-12 w-12 text-white animate-spin mx-auto" />
                                                        <p className="text-white mt-2">
                                                            Memproses...
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-center gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={stopScanning}
                                                disabled={isLoading}
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Tutup Kamera
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Scans */}
                        {recentVisits.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Kunjungan Terbaru
                                    </CardTitle>
                                    <CardDescription>
                                        Riwayat kunjungan yang baru saja dicatat
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[300px]">
                                        <div className="space-y-3">
                                            {recentVisits.map((visit) => (
                                                <div
                                                    key={visit.id}
                                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage
                                                                src={
                                                                    visit.user
                                                                        .avatar
                                                                }
                                                            />
                                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                                {getUserInitials(
                                                                    visit.user
                                                                        .name
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">
                                                                {
                                                                    visit.user
                                                                        .name
                                                                }
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {getUserRoleBadge(
                                                                    visit.user
                                                                        .role
                                                                )}
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(
                                                                        visit.created_at
                                                                    ).toLocaleTimeString(
                                                                        "id-ID",
                                                                        {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        }
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className="gap-1"
                                                    >
                                                        <Award className="h-3 w-3" />
                                                        +10 poin
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Tab Input Manual */}
                    <TabsContent value="manual" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5" />
                                    Input Kunjungan Manual
                                </CardTitle>
                                <CardDescription>
                                    Cari dan pilih pengguna untuk mencatat
                                    kunjungan secara manual (bisa multiple)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Search Input */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari berdasarkan nama, NIS, NIP, atau email..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                    {searching && (
                                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                </div>

                                {/* Selected Users List */}
                                {selectedUsers.length > 0 && (
                                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <ListChecks className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-medium">
                                                    Dipilih (
                                                    {selectedUsers.length}{" "}
                                                    pengguna)
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={clearSelectedUsers}
                                                    className="h-8 text-xs"
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                    Hapus Semua
                                                </Button>
                                                <Button
                                                    onClick={handleBatchSubmit}
                                                    disabled={submitting}
                                                    size="sm"
                                                    className="h-8 gap-2"
                                                >
                                                    {submitting ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <UserCheck className="h-3 w-3" />
                                                    )}
                                                    Catat Semua
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedUsers.map((user) => (
                                                <Badge
                                                    key={user.id}
                                                    variant="secondary"
                                                    className="gap-1 pl-2 pr-1 py-1"
                                                >
                                                    <span>{user.name}</span>
                                                    <button
                                                        onClick={() =>
                                                            removeSelectedUser(
                                                                user.id
                                                            )
                                                        }
                                                        className="ml-1 rounded-full hover:bg-muted p-0.5"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Search Results with Checkboxes */}
                                {searchQuery.length >= 2 && (
                                    <ScrollArea className="h-[400px] rounded-lg border">
                                        {searchResults.length === 0 &&
                                            !searching && (
                                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                                    <User className="h-12 w-12 text-muted-foreground/50" />
                                                    <p className="mt-2 text-sm text-muted-foreground">
                                                        Tidak ada pengguna
                                                        ditemukan
                                                    </p>
                                                </div>
                                            )}

                                        {searchResults.map((user) => {
                                            const isSelected =
                                                selectedUsers.some(
                                                    (u) => u.id === user.id
                                                );
                                            const isAlreadyVisited =
                                                todayVisits.some(
                                                    (v) => v.user.id === user.id
                                                );

                                            return (
                                                <motion.div
                                                    key={user.id}
                                                    initial={{
                                                        opacity: 0,
                                                        y: 10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    className={`p-4 border-b last:border-b-0 transition-colors ${
                                                        isSelected
                                                            ? "bg-primary/5 border-primary/20"
                                                            : "hover:bg-muted/50"
                                                    } ${
                                                        isAlreadyVisited
                                                            ? "opacity-60"
                                                            : ""
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() =>
                                                                toggleUserSelection(
                                                                    user
                                                                )
                                                            }
                                                            disabled={
                                                                isAlreadyVisited
                                                            }
                                                            className="mt-2"
                                                        />
                                                        <Avatar className="h-12 w-12">
                                                            <AvatarImage
                                                                src={
                                                                    user.avatar
                                                                }
                                                            />
                                                            <AvatarFallback className="bg-primary/10 text-primary text-lg">
                                                                {getUserInitials(
                                                                    user.name
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="font-semibold">
                                                                    {user.name}
                                                                </p>
                                                                {getUserRoleBadge(
                                                                    user.role
                                                                )}
                                                                {isAlreadyVisited && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="bg-yellow-50 text-yellow-700 border-yellow-200"
                                                                    >
                                                                        Sudah
                                                                        Absen
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                                                {user.role ===
                                                                    "student" &&
                                                                    user.class && (
                                                                        <>
                                                                            <GraduationCap className="h-3 w-3" />
                                                                            <span>
                                                                                {
                                                                                    user.class
                                                                                }
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                {user.role ===
                                                                    "student" &&
                                                                    (user.nisn ||
                                                                        user.nis) && (
                                                                        <>
                                                                            <span>
                                                                                •
                                                                            </span>
                                                                            <Hash className="h-3 w-3" />
                                                                            <span>
                                                                                {user.nisn ||
                                                                                    user.nis}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                {user.role ===
                                                                    "teacher" &&
                                                                    user.nip && (
                                                                        <>
                                                                            <Building2 className="h-3 w-3" />
                                                                            <span>
                                                                                NIP:{" "}
                                                                                {
                                                                                    user.nip
                                                                                }
                                                                            </span>
                                                                        </>
                                                                    )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                                <Mail className="h-3 w-3" />
                                                                <span>
                                                                    {user.email}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {isSelected && (
                                                            <CheckCircle className="h-5 w-5 text-primary" />
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </ScrollArea>
                                )}
                            </CardContent>
                        </Card>

                        {/* Today's Visits List */}
                        {todayVisits.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Kunjungan Hari Ini
                                    </CardTitle>
                                    <CardDescription>
                                        Daftar pengguna yang sudah melakukan
                                        kunjungan hari ini
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[300px]">
                                        <div className="space-y-2">
                                            {todayVisits.map((visit) => (
                                                <div
                                                    key={visit.id}
                                                    className="flex items-center justify-between p-3 rounded-lg border"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                                                {getUserInitials(
                                                                    visit.user
                                                                        .name
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {
                                                                    visit.user
                                                                        .name
                                                                }
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {visit.user
                                                                    .role ===
                                                                    "student" &&
                                                                visit.user.class
                                                                    ? visit.user
                                                                          .class
                                                                    : visit.user
                                                                          .role ===
                                                                      "teacher"
                                                                    ? "Guru"
                                                                    : "Pengunjung"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(
                                                                visit.created_at
                                                            ).toLocaleTimeString(
                                                                "id-ID",
                                                                {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                }
                                                            )}
                                                        </p>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs mt-1"
                                                        >
                                                            +10 poin
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Batch Result Dialog */}
            <AnimatePresence>
                {showResultDialog && batchResult && (
                    <ModalPortal>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                            onClick={() => setShowResultDialog(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-2xl rounded-3xl bg-card p-6 shadow-xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-foreground">
                                        Hasil Pencatatan Kunjungan
                                    </h3>
                                    <button
                                        onClick={() =>
                                            setShowResultDialog(false)
                                        }
                                        className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Success Section */}
                                {batchResult.success.length > 0 && (
                                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <span className="font-semibold text-green-800">
                                                Berhasil (
                                                {batchResult.success.length}{" "}
                                                pengguna)
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {batchResult.success.map((user) => (
                                                <Badge
                                                    key={user.id}
                                                    className="bg-green-100 text-green-800"
                                                >
                                                    {user.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Failed Section */}
                                {batchResult.failed.length > 0 && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className="h-5 w-5 text-red-600" />
                                            <span className="font-semibold text-red-800">
                                                Gagal (
                                                {batchResult.failed.length}{" "}
                                                pengguna)
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {batchResult.failed.map((fail) => (
                                                <div
                                                    key={fail.user.id}
                                                    className="text-sm"
                                                >
                                                    <span className="font-medium text-red-800">
                                                        {fail.user.name}:
                                                    </span>
                                                    <span className="text-red-700 ml-1">
                                                        {fail.reason}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 flex justify-end">
                                    <Button
                                        onClick={() =>
                                            setShowResultDialog(false)
                                        }
                                    >
                                        Tutup
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </ModalPortal>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}

// Modal Portal Component
function ModalPortal({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(children, document.body);
}
