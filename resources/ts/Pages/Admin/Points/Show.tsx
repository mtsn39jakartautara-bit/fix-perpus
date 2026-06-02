// pages/admin/points/[id].tsx
import { useState } from "react";
import { router } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Trophy,
    Medal,
    Star,
    ArrowLeft,
    Calendar,
    Users,
    Award,
    TrendingUp,
    GraduationCap,
    Briefcase,
    ExternalLink,
    Download,
    Printer,
} from "lucide-react";
import { AdminLayout } from "@/Layouts/AppShellAdmin";
import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
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
import { Separator } from "@/Components/ui/separator";

interface UserResult {
    user_id: number;
    email: string;
    role: string;
    user_name: string;
    user_role: string;
    final_points: number;
    rank: number;
    class?: string;
    nis?: string;
    nip?: string;
}

interface PeriodData {
    id: number;
    name: string;
    started_at: string;
    ended_at: string;
    created_by?: {
        id: number;
        name: string;
    };
    results: UserResult[];
    total_participants: number;
    total_points: number;
    average_points: number;
}

interface RoleStats {
    role: string;
    roleLabel: string;
    count: number;
    totalPoints: number;
    averagePoints: number;
    icon: any;
    color: string;
}

interface Props {
    period: PeriodData;
    roleStats: RoleStats[];
    overallRankings: UserResult[];
    roleRankings: {
        student: UserResult[];
        teacher: UserResult[];
        external: UserResult[];
    };
}

export default function PeriodDetail({
    period,
    roleStats,
    overallRankings,
    roleRankings,
}: Props) {
    const [activeTab, setActiveTab] = useState<string>("all");

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
        if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
        if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
        return <Star className="h-4 w-4 text-muted-foreground" />;
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

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        // Create CSV data
        const headers = [
            "Peringkat",
            "Nama",
            "Role",
            "Kelas/NIP",
            "Poin Akhir",
        ];
        const rows = overallRankings.map((user) => [
            user.rank,
            user.user_name,
            getRoleLabel(user.user_role),
            user.role === "student"
                ? user.class || user.nis || "-"
                : user.nip || "-",
            user.final_points,
        ]);

        const csvContent = [headers, ...rows]
            .map((row) => row.join(","))
            .join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${period.name}_rankings.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                router.get(route("admin.points.index"))
                            }
                            className="shrink-0"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                {period.name}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Detail periode dan peringkat akhir
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            className="gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handlePrint}
                            className="gap-2"
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </Button>
                    </div>
                </div>

                {/* Period Info Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Periode
                                    </p>
                                    <p className="text-lg font-bold">
                                        {period.name}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-primary/10">
                                    <Calendar className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                                {new Date(period.started_at).toLocaleDateString(
                                    "id-ID",
                                    {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    }
                                )}{" "}
                                -{" "}
                                {new Date(period.ended_at).toLocaleDateString(
                                    "id-ID",
                                    {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    }
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Peserta
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {period.total_participants.toLocaleString()}
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
                                        Total Poin
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {period.total_points.toLocaleString()}
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
                                        Rata-rata Poin
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {period.average_points}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-purple-500/20">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Role Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    {roleStats.map((stat) => (
                        <Card
                            key={stat.role}
                            className={`border-2 ${stat.color
                                .replace("text", "border")
                                .replace("bg", "")}`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {stat.icon && (
                                            <stat.icon className="h-5 w-5" />
                                        )}
                                        <span className="font-semibold">
                                            {stat.roleLabel}
                                        </span>
                                    </div>
                                    <Badge className={stat.color}>
                                        {stat.count} Peserta
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Total Poin
                                        </span>
                                        <span className="font-semibold">
                                            {stat.totalPoints.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Rata-rata
                                        </span>
                                        <span className="font-semibold">
                                            {stat.averagePoints}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Rankings Tabs */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Peringkat Akhir
                        </CardTitle>
                        <CardDescription>
                            Hasil peringkat periode {period.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="space-y-4"
                        >
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

                            {/* All Rankings */}
                            <TabsContent value="all">
                                <ScrollArea className="h-[500px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-20">
                                                    Peringkat
                                                </TableHead>
                                                <TableHead>Nama</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Detail</TableHead>
                                                <TableHead className="text-right">
                                                    Poin Akhir
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {overallRankings.map((user) => (
                                                <TableRow key={user.user_id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {getRankIcon(
                                                                user.rank
                                                            )}
                                                            <span className="font-medium">
                                                                #{user.rank}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {user.user_name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={getRoleColor(
                                                                user.user_role
                                                            )}
                                                        >
                                                            <span className="flex items-center gap-1">
                                                                {getRoleIcon(
                                                                    user.user_role
                                                                )}
                                                                {getRoleLabel(
                                                                    user.user_role
                                                                )}
                                                            </span>
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {user.user_role ===
                                                            "student" && (
                                                            <div>
                                                                {user.class && (
                                                                    <div>
                                                                        Kelas:{" "}
                                                                        {
                                                                            user.class
                                                                        }
                                                                    </div>
                                                                )}
                                                                {user.nis && (
                                                                    <div>
                                                                        NIS:{" "}
                                                                        {
                                                                            user.nis
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {user.user_role ===
                                                            "teacher" &&
                                                            user.nip && (
                                                                <div>
                                                                    NIP:{" "}
                                                                    {user.nip}
                                                                </div>
                                                            )}
                                                        {user.user_role ===
                                                            "external" && "-"}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="text-lg font-bold text-primary">
                                                                {user.final_points.toLocaleString()}
                                                            </span>
                                                            {getRankBadge(
                                                                user.rank
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </TabsContent>

                            {/* Student Rankings */}
                            <TabsContent value="student">
                                <ScrollArea className="h-[500px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-20">
                                                    Peringkat
                                                </TableHead>
                                                <TableHead>Nama</TableHead>
                                                <TableHead>Kelas</TableHead>
                                                <TableHead>NIS</TableHead>
                                                <TableHead className="text-right">
                                                    Poin Akhir
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {roleRankings.student.map(
                                                (user) => (
                                                    <TableRow
                                                        key={user.user_id}
                                                    >
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {getRankIcon(
                                                                    user.rank
                                                                )}
                                                                <span className="font-medium">
                                                                    #{user.rank}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {user.user_name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {user.class || "-"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {user.nis || "-"}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex flex-col items-end gap-1">
                                                                <span className="text-lg font-bold text-primary">
                                                                    {user.final_points.toLocaleString()}
                                                                </span>
                                                                {getRankBadge(
                                                                    user.rank
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </TabsContent>

                            {/* Teacher Rankings */}
                            <TabsContent value="teacher">
                                <ScrollArea className="h-[500px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-20">
                                                    Peringkat
                                                </TableHead>
                                                <TableHead>Nama</TableHead>
                                                <TableHead>NIP</TableHead>
                                                <TableHead className="text-right">
                                                    Poin Akhir
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {roleRankings.teacher.map(
                                                (user) => (
                                                    <TableRow
                                                        key={user.user_id}
                                                    >
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {getRankIcon(
                                                                    user.rank
                                                                )}
                                                                <span className="font-medium">
                                                                    #{user.rank}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {user.user_name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {user.nip || "-"}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex flex-col items-end gap-1">
                                                                <span className="text-lg font-bold text-primary">
                                                                    {user.final_points.toLocaleString()}
                                                                </span>
                                                                {getRankBadge(
                                                                    user.rank
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </TabsContent>

                            {/* External Rankings */}
                            <TabsContent value="external">
                                <ScrollArea className="h-[500px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-20">
                                                    Peringkat
                                                </TableHead>
                                                <TableHead>Nama</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead className="text-right">
                                                    Poin Akhir
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {roleRankings.external.map(
                                                (user) => (
                                                    <TableRow
                                                        key={user.user_id}
                                                    >
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {getRankIcon(
                                                                    user.rank
                                                                )}
                                                                <span className="font-medium">
                                                                    #{user.rank}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {user.user_name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {user.email || "-"}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex flex-col items-end gap-1">
                                                                <span className="text-lg font-bold text-primary">
                                                                    {user.final_points.toLocaleString()}
                                                                </span>
                                                                {getRankBadge(
                                                                    user.rank
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
