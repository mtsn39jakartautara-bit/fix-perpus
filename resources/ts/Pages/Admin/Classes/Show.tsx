import { motion } from "framer-motion";
import { Link } from "@inertiajs/react";
import {
    ArrowLeft,
    GraduationCap,
    Users,
    Calendar,
    User,
    Mail,
    Eye,
} from "lucide-react";
import { AdminLayout } from "@/Layouts/AppShellAdmin";
import { Class } from "@/types/class";

interface Props {
    class: Class;
    students: Array<{
        id: number | string | any;
        nis: string;
        user: {
            id: number | string | any;
            name: string;
            email: string;
        };
    }>;
    activeAcademicYear: { id: number; name: string } | null;
}

const fade = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
};

export default function ClassesShow({
    class: classItem,
    students,
    activeAcademicYear,
}: Props) {
    const getLevelLabel = (level: number) => {
        const labels: { [key: number]: string } = {
            1: "Kelas 1 SD",
            2: "Kelas 2 SD",
            3: "Kelas 3 SD",
            4: "Kelas 4 SD",
            5: "Kelas 5 SD",
            6: "Kelas 6 SD",
            7: "Kelas 7 SMP",
            8: "Kelas 8 SMP",
            9: "Kelas 9 SMP",
            10: "Kelas 10 SMA",
            11: "Kelas 11 SMA",
            12: "Kelas 12 SMA",
        };
        return labels[level] || `Kelas ${level}`;
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
                    <div className="flex items-center gap-4">
                        <Link
                            href={route("admin.classes.index")}
                            className="rounded-xl bg-card p-2 shadow-soft transition-all hover:bg-muted"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                                    Detail Kelas
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Informasi lengkap data kelas dan daftar
                                    siswa
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Class Info */}
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        <div className="rounded-3xl bg-card shadow-soft overflow-hidden sticky top-8">
                            {/* Class Header */}
                            <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-6 text-center">
                                <div className="mx-auto w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mb-4">
                                    <GraduationCap className="w-10 h-10 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold">
                                    {classItem.name}
                                </h2>
                                <div className="mt-2 flex items-center justify-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                                        {getLevelLabel(classItem.level)}
                                    </span>
                                </div>
                            </div>

                            {/* Class Details */}
                            <div className="p-6 space-y-4">
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                        Informasi Kelas
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3 text-sm">
                                            <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-muted-foreground">
                                                    Jumlah Siswa
                                                </p>
                                                <p className="font-medium text-lg">
                                                    {students.length} Siswa
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-muted-foreground">
                                                    Tahun Ajaran Aktif
                                                </p>
                                                <p className="font-medium">
                                                    {activeAcademicYear?.name ||
                                                        "-"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-muted-foreground">
                                                    Dibuat Pada
                                                </p>
                                                <p className="font-medium">
                                                    {new Date(
                                                        classItem.created_at
                                                    ).toLocaleDateString(
                                                        "id-ID",
                                                        {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column - Students List */}
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <div className="rounded-3xl bg-card shadow-soft overflow-hidden">
                            <div className="border-b border-border px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold">
                                        Daftar Siswa
                                    </h3>
                                    <span className="ml-auto text-sm text-muted-foreground">
                                        Total: {students.length} siswa
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                {students.length > 0 ? (
                                    <div className="space-y-3">
                                        {students.map((student, index) => (
                                            <div
                                                key={student.id}
                                                className="flex items-center justify-between rounded-xl border border-border p-4 hover:shadow-soft transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="text-sm font-bold text-primary">
                                                            {student.user.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {student.user.name}
                                                        </p>
                                                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                NIS:{" "}
                                                                {student.nis}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />
                                                                {
                                                                    student.user
                                                                        .email
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Link
                                                    href={route(
                                                        "admin.users.show.student",
                                                        student.user.id
                                                    )}
                                                    className="rounded-lg bg-primary/10 p-2 text-primary transition-all hover:bg-primary/20"
                                                    title="Lihat Detail Siswa"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-muted-foreground">
                                            Belum ada siswa yang terdaftar di
                                            kelas ini
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Pastikan tahun ajaran aktif sudah
                                            dipilih
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AdminLayout>
    );
}
