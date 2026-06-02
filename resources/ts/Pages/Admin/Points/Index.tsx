// pages/admin/points/index.tsx
import { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Award,
    Trophy,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Loader2,
    Users,
    Calendar,
    TrendingUp,
    Medal,
    Star,
    Shield,
    GraduationCap,
    Briefcase,
    ExternalLink,
    BarChart3,
    Archive,
    Eye,
} from "lucide-react";
import { AdminLayout } from "@/Layouts/AppShellAdmin";
import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import { Badge } from "@/Components/ui/badge";
import { Progress } from "@/Components/ui/progress";
import { Separator } from "@/Components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { toast } from "sonner";

interface UserRanking {
    id: number;
    name: string;
    role: string;
    total_points: number;
    rank: number;
    class?: string;
    nis?: string;
    nip?: string;
}

interface RoleRanking {
    role: string;
    roleLabel: string;
    users: UserRanking[];
    icon: any;
    color: string;
}

interface PeriodArchive {
    id: number | string | any;
    name: string;
    started_at: string;
    ended_at: string;
    results: Array<{
        user_id: number;
        user_name: string;
        user_role: string;
        final_points: number;
        rank: number;
    }>;
}

interface Props {
    currentPeriod?: {
        id: number;
        name: string;
        started_at: string;
        is_active: boolean;
    };
    overallRankings: UserRanking[];
    roleRankings: RoleRanking[];
    periodArchives: PeriodArchive[];
    totalUsers: number;
    totalPoints: number;
    averagePoints: number;
}

export default function PointManagement({
    currentPeriod,
    overallRankings = [],
    roleRankings = [],
    periodArchives = [],
    totalUsers = 0,
    totalPoints = 0,
    averagePoints = 0,
}: Props) {
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [selectedArchive, setSelectedArchive] =
        useState<PeriodArchive | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>("all");

    const handleResetPoints = () => {
        setIsResetting(true);

        router.post(
            route("admin.points.reset"),
            {},
            {
                onSuccess: () => {
                    setResetSuccess(true);

                    toast.success("Reset point berhasil!", {
                        description: "Periode baru telah dimulai.",
                    });

                    setTimeout(() => {
                        router.reload();
                    }, 2000);
                },

                onError: (errors) => {
                    console.error(errors);

                    toast.error("Gagal mereset point", {
                        description: "Terjadi kesalahan, silakan coba lagi.",
                    });
                },

                onFinish: () => {
                    setIsResetting(false);
                    setIsResetDialogOpen(false);
                },
            }
        );
    };
    const stats = {
        totalUsers: totalUsers,
        totalPoints: totalPoints,
        averagePoints: averagePoints,
        activePeriod: currentPeriod?.name || "Season 3",
        periodStart: currentPeriod?.started_at
            ? new Date(currentPeriod.started_at).toLocaleDateString("id-ID")
            : "1 Jan 2024",
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
        if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
        return <Star className="h-5 w-5 text-muted-foreground" />;
    };

    const getRankBadge = (rank: number) => {
        if (rank === 1)
            return (
                <Badge className="bg-yellow-500 hover:bg-yellow-600">
                    Juara 1
                </Badge>
            );
        if (rank === 2)
            return (
                <Badge className="bg-gray-400 hover:bg-gray-500">Juara 2</Badge>
            );
        if (rank === 3)
            return (
                <Badge className="bg-amber-600 hover:bg-amber-700">
                    Juara 3
                </Badge>
            );
        return <Badge variant="outline">Peringkat {rank}</Badge>;
    };

    const getRoleLabel = (role: string) => {
        const roleMap: Record<string, string> = {
            student: "Siswa",
            teacher: "Guru",
            external: "Eksternal",
            admin: "Admin",
        };
        return roleMap[role] || role;
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "student":
                return <GraduationCap className="h-4 w-4" />;
            case "teacher":
                return <Briefcase className="h-4 w-4" />;
            case "external":
                return <ExternalLink className="h-4 w-4" />;
            default:
                return <Users className="h-4 w-4" />;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case "student":
                return "bg-blue-500/10 text-blue-600 border-blue-200";
            case "teacher":
                return "bg-green-500/10 text-green-600 border-green-200";
            case "external":
                return "bg-purple-500/10 text-purple-600 border-purple-200";
            default:
                return "bg-gray-500/10 text-gray-600 border-gray-200";
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            Manajemen Point
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Kelola poin pengguna, lihat ranking per role, dan
                            arsipkan periode
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsResetDialogOpen(true)}
                        className="gap-2 bg-red-600 hover:bg-red-700"
                        disabled={isResetting}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Reset Point Periode
                    </Button>
                </div>

                {/* Alert for reset success */}
                <AnimatePresence>
                    {resetSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-green-50 border border-green-200 rounded-lg p-4"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <p className="text-green-800 font-medium">
                                    Reset point berhasil! Periode baru telah
                                    dimulai.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Pengguna
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stats.totalUsers.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-500/20">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Point
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stats.totalPoints.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-green-500/20">
                                    <Award className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Rata-rata Point
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {stats.averagePoints}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-purple-500/20">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Periode Aktif
                                    </p>
                                    <p className="text-lg font-bold">
                                        {stats.activePeriod}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Mulai: {stats.periodStart}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-orange-500/20">
                                    <Calendar className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content - Tabs for Rankings */}
                <Tabs defaultValue="all" className="space-y-6">
                    <TabsList className="grid w-full max-w-md grid-cols-4">
                        <TabsTrigger value="all" className="gap-2">
                            <Trophy className="h-4 w-4" />
                            Semua
                        </TabsTrigger>
                        <TabsTrigger value="student" className="gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Siswa
                        </TabsTrigger>
                        <TabsTrigger value="teacher" className="gap-2">
                            <Briefcase className="h-4 w-4" />
                            Guru
                        </TabsTrigger>
                        <TabsTrigger value="external" className="gap-2">
                            <ExternalLink className="h-4 w-4" />
                            Eksternal
                        </TabsTrigger>
                    </TabsList>

                    {/* All Rankings Tab */}
                    <TabsContent value="all" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                    Peringkat Keseluruhan
                                </CardTitle>
                                <CardDescription>
                                    Top 10 pengguna dengan poin tertinggi
                                    periode ini
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[500px]">
                                    <div className="space-y-3">
                                        {overallRankings.map((user, index) => (
                                            <motion.div
                                                key={user.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: index * 0.05,
                                                }}
                                                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center justify-center w-12">
                                                        {getRankIcon(user.rank)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-lg">
                                                            {user.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge
                                                                className={getRoleColor(
                                                                    user.role
                                                                )}
                                                            >
                                                                <span className="flex items-center gap-1">
                                                                    {getRoleIcon(
                                                                        user.role
                                                                    )}
                                                                    {getRoleLabel(
                                                                        user.role
                                                                    )}
                                                                </span>
                                                            </Badge>
                                                            {user.role ===
                                                                "student" &&
                                                                user.class && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        Kelas:{" "}
                                                                        {
                                                                            user.class
                                                                        }
                                                                    </span>
                                                                )}
                                                            {user.role ===
                                                                "student" &&
                                                                user.nis && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        NIS:{" "}
                                                                        {
                                                                            user.nis
                                                                        }
                                                                    </span>
                                                                )}
                                                            {user.role ===
                                                                "teacher" &&
                                                                user.nip && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        NIP:{" "}
                                                                        {
                                                                            user.nip
                                                                        }
                                                                    </span>
                                                                )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-primary">
                                                        {user.total_points.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        poin
                                                    </p>
                                                    {getRankBadge(user.rank)}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Role-specific Rankings Tabs */}
                    {roleRankings.map((roleData) => (
                        <TabsContent
                            key={roleData.role}
                            value={roleData.role}
                            className="space-y-6"
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        {roleData.icon && (
                                            <roleData.icon className="h-5 w-5" />
                                        )}
                                        Peringkat {roleData.roleLabel}
                                    </CardTitle>
                                    <CardDescription>
                                        Top 10 {roleData.roleLabel} dengan poin
                                        tertinggi periode ini
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[500px]">
                                        <div className="space-y-3">
                                            {roleData.users.map(
                                                (user, index) => (
                                                    <motion.div
                                                        key={user.id}
                                                        initial={{
                                                            opacity: 0,
                                                            x: -20,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            x: 0,
                                                        }}
                                                        transition={{
                                                            delay: index * 0.05,
                                                        }}
                                                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center justify-center w-12">
                                                                {getRankIcon(
                                                                    user.rank
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-lg">
                                                                    {user.name}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    {user.role ===
                                                                        "student" &&
                                                                        user.class && (
                                                                            <span className="text-xs text-muted-foreground">
                                                                                Kelas:{" "}
                                                                                {
                                                                                    user.class
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    {user.role ===
                                                                        "student" &&
                                                                        user.nis && (
                                                                            <span className="text-xs text-muted-foreground">
                                                                                NIS:{" "}
                                                                                {
                                                                                    user.nis
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    {user.role ===
                                                                        "teacher" &&
                                                                        user.nip && (
                                                                            <span className="text-xs text-muted-foreground">
                                                                                NIP:{" "}
                                                                                {
                                                                                    user.nip
                                                                                }
                                                                            </span>
                                                                        )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xl font-bold text-primary">
                                                                {user.total_points.toLocaleString()}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                poin
                                                            </p>
                                                            {getRankBadge(
                                                                user.rank
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )
                                            )}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>

                {/* Period Archives Section */}
                {periodArchives.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Archive className="h-5 w-5" />
                                Arsip Periode
                            </CardTitle>
                            <CardDescription>
                                Riwayat periode sebelumnya dan peringkat per
                                role
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {periodArchives.map((archive) => (
                                    <Dialog key={archive.id}>
                                        <DialogTrigger asChild>
                                            <Card className="cursor-pointer hover:shadow-lg transition-all">
                                                <CardHeader>
                                                    <CardTitle className="text-lg">
                                                        {archive.name}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {new Date(
                                                            archive.started_at
                                                        ).toLocaleDateString(
                                                            "id-ID"
                                                        )}{" "}
                                                        -{" "}
                                                        {new Date(
                                                            archive.ended_at
                                                        ).toLocaleDateString(
                                                            "id-ID"
                                                        )}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span>
                                                            Total Peserta
                                                        </span>
                                                        <span className="font-semibold">
                                                            {
                                                                archive.results
                                                                    .length
                                                            }
                                                        </span>
                                                    </div>
                                                    <Link
                                                        href={route(
                                                            "admin.points.show",
                                                            archive.id
                                                        )}
                                                        className="w-full mt-3 gap-2 flex items-center justify-center bg-primary/10 py-2 rounded-xl text-sm font-medium text-primary"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        Lihat Detail
                                                    </Link>
                                                </CardContent>
                                            </Card>
                                        </DialogTrigger>
                                    </Dialog>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Reset Confirmation Dialog */}
                <AlertDialog
                    open={isResetDialogOpen}
                    onOpenChange={setIsResetDialogOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                Reset Point Periode
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                <div className="space-y-3 mt-2">
                                    <p>Tindakan ini akan:</p>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        <li>
                                            Menyimpan data poin periode{" "}
                                            <strong>
                                                {stats.activePeriod}
                                            </strong>{" "}
                                            ke arsip
                                        </li>
                                        <li>
                                            Menyimpan peringkat per role (Siswa,
                                            Guru, Eksternal)
                                        </li>
                                        <li>
                                            Mereset semua poin pengguna menjadi{" "}
                                            <strong>0</strong>
                                        </li>
                                        <li>
                                            Memulai periode baru secara otomatis
                                        </li>
                                    </ul>
                                    <p className="font-medium text-red-600 mt-2">
                                        Tindakan ini tidak dapat dibatalkan!
                                    </p>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isResetting}>
                                Batal
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleResetPoints}
                                disabled={isResetting}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isResetting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Mereset...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Ya, Reset Point
                                    </>
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AdminLayout>
    );
}
