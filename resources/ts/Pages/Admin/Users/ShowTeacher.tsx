import { useState } from "react";
import { motion } from "framer-motion";
import { Link, router } from "@inertiajs/react";
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    BookOpen,
    Clock,
    Award,
    RefreshCw,
    Barcode,
    CheckCircle,
    Eye,
    Briefcase,
    User2Icon,
} from "lucide-react";
import { AdminLayout } from "@/Layouts/AppShellAdmin";
import { User } from "@/types/user";
import { QRCodeSVG } from "qrcode.react";

interface Borrowing {
    id: number;
    borrowed_at: string;
    due_date: string;
    returned_at: string | null;
    status: "borrowed" | "returned" | "late";
    fine_amount: number;
    fine_paid: boolean;
    book_item: {
        barcode: string;
        physical_book: {
            title: string;
            author: string | null;
            publisher: string | null;
        };
    };
}

interface Visit {
    id: number;
    type: "online" | "offline";
    created_at: string;
}

interface Props {
    user: User;
    borrowings: Borrowing[];
    visits: Visit[];
}

const fade = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
};

const borrowingStatusConfig = {
    borrowed: { label: "Dipinjam", color: "text-blue-600", bg: "bg-blue-100" },
    returned: {
        label: "Dikembalikan",
        color: "text-green-600",
        bg: "bg-green-100",
    },
    late: { label: "Terlambat", color: "text-red-600", bg: "bg-red-100" },
};

export default function ShowTeacher({ user, borrowings, visits }: Props) {
    const [showBarcode, setShowBarcode] = useState(true);

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
                            href={route("admin.users.teachers")}
                            className="rounded-xl bg-card p-2 shadow-soft transition-all hover:bg-muted"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                                <User2Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                                    Detail Guru
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Informasi lengkap data guru
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Profile Info */}
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        <div className="rounded-3xl bg-card shadow-soft overflow-hidden sticky top-8">
                            {/* Profile Header */}
                            <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-6 text-center">
                                {/* Avatar atau Barcode */}
                                {showBarcode && user.barcode ? (
                                    <div className="mx-auto mb-4 flex items-center justify-center">
                                        <QRCodeSVG
                                            value={user.barcode}
                                            size={120}
                                            level="H"
                                            bgColor="transparent"
                                            fgColor="#0D5D5D"
                                        />
                                    </div>
                                ) : (
                                    <div className="mx-auto w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center mb-4">
                                        <span className="text-4xl font-bold text-primary">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <h2 className="text-xl font-bold">
                                    {user.name}
                                </h2>
                                <div className="mt-2 flex items-center justify-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                        <Briefcase className="h-3 w-3" />
                                        {user.teacher?.subject ||
                                            "Mata Pelajaran"}
                                    </span>
                                </div>
                            </div>

                            {/* Profile Details */}
                            <div className="p-6 space-y-4">
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                        Informasi Pribadi
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3 text-sm">
                                            <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-muted-foreground">
                                                    NIP
                                                </p>
                                                <p className="font-medium">
                                                    {user.teacher?.nip || "-"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 text-sm">
                                            <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-muted-foreground">
                                                    Mata Pelajaran
                                                </p>
                                                <p className="font-medium">
                                                    {user.teacher?.subject ||
                                                        "-"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-muted-foreground">
                                                    Email
                                                </p>
                                                <p className="font-medium break-all">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-muted-foreground">
                                                    No. Telepon
                                                </p>
                                                <p className="font-medium">
                                                    {user.teacher?.phone || "-"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-muted-foreground">
                                                    Bergabung Sejak
                                                </p>
                                                <p className="font-medium">
                                                    {new Date(
                                                        user.created_at
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
                                        {user.teacher?.address && (
                                            <div className="flex items-start gap-3 text-sm">
                                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-muted-foreground">
                                                        Alamat
                                                    </p>
                                                    <p className="font-medium">
                                                        {user.teacher.address}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Points Summary */}
                                <div className="pt-4 border-t border-border">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                        Ringkasan Poin
                                    </h3>
                                    <div className="rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 p-4 text-center">
                                        <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                                        <p className="text-3xl font-bold text-primary">
                                            {user.total_points || 0}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Total Poin
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column - Activity History */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Borrowing History */}
                        <motion.div
                            {...fade}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="rounded-3xl bg-card shadow-soft overflow-hidden"
                        >
                            <div className="border-b border-border px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold">
                                        Riwayat Peminjaman
                                    </h3>
                                </div>
                            </div>
                            <div className="p-6">
                                {borrowings.length > 0 ? (
                                    <div className="space-y-4">
                                        {borrowings.map((borrowing) => {
                                            const statusConfig =
                                                borrowingStatusConfig[
                                                    borrowing.status
                                                ];
                                            return (
                                                <div
                                                    key={borrowing.id}
                                                    className="rounded-xl border border-border p-4 hover:shadow-soft transition-all"
                                                >
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-medium">
                                                                {
                                                                    borrowing
                                                                        .book_item
                                                                        .physical_book
                                                                        .title
                                                                }
                                                            </h4>
                                                            <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                                <span>
                                                                    Penulis:{" "}
                                                                    {borrowing
                                                                        .book_item
                                                                        .physical_book
                                                                        .author ||
                                                                        "-"}
                                                                </span>
                                                                <span>
                                                                    Barcode:{" "}
                                                                    {
                                                                        borrowing
                                                                            .book_item
                                                                            .barcode
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="mt-2 flex flex-wrap gap-3 text-xs">
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    <span>
                                                                        Pinjam:{" "}
                                                                        {new Date(
                                                                            borrowing.borrowed_at
                                                                        ).toLocaleDateString(
                                                                            "id-ID"
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    <span>
                                                                        Batas:{" "}
                                                                        {new Date(
                                                                            borrowing.due_date
                                                                        ).toLocaleDateString(
                                                                            "id-ID"
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                {borrowing.returned_at && (
                                                                    <div className="flex items-center gap-1 text-green-600">
                                                                        <CheckCircle className="h-3 w-3" />
                                                                        <span>
                                                                            Kembali:{" "}
                                                                            {new Date(
                                                                                borrowing.returned_at
                                                                            ).toLocaleDateString(
                                                                                "id-ID"
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <span
                                                                className={`rounded-full px-2 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}
                                                            >
                                                                {
                                                                    statusConfig.label
                                                                }
                                                            </span>
                                                            {borrowing.fine_amount >
                                                                0 && (
                                                                <span className="text-xs text-red-600">
                                                                    Denda: Rp{" "}
                                                                    {borrowing.fine_amount.toLocaleString()}
                                                                    {!borrowing.fine_paid && (
                                                                        <span className="ml-1 text-red-500">
                                                                            (Belum
                                                                            Dibayar)
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-muted-foreground">
                                            Belum ada riwayat peminjaman
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Visit History */}
                        <motion.div
                            {...fade}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="rounded-3xl bg-card shadow-soft overflow-hidden"
                        >
                            <div className="border-b border-border px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <Eye className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold">
                                        Riwayat Kunjungan
                                    </h3>
                                </div>
                            </div>
                            <div className="p-6">
                                {visits.length > 0 ? (
                                    <div className="space-y-3">
                                        {visits.map((visit) => (
                                            <div
                                                key={visit.id}
                                                className="flex items-center justify-between rounded-xl border border-border p-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        {visit.type === "online"
                                                            ? "🌐"
                                                            : "🏛️"}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">
                                                            {visit.type ===
                                                            "online"
                                                                ? "Kunjungan Online"
                                                                : "Kunjungan Offline"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(
                                                                visit.created_at
                                                            ).toLocaleString(
                                                                "id-ID",
                                                                {
                                                                    day: "numeric",
                                                                    month: "long",
                                                                    year: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                }
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-medium text-primary">
                                                        +
                                                        {visit.type === "online"
                                                            ? 5
                                                            : 10}{" "}
                                                        Poin
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-muted-foreground">
                                            Belum ada riwayat kunjungan
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
