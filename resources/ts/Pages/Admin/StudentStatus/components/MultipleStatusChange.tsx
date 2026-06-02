// resources/js/Pages/Admin/StudentStatus/components/MultipleStatusChange.tsx

import { useState } from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { Card } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import axios from "axios";

interface Statuses {
    transferred: string;
    dropped: string;
}

interface Props {
    statuses: Statuses;
}

interface PreviewData {
    row_number: number;
    nis: string;
    notes: string;
    student_name: string;
    current_status: string;
    current_class: string;
    new_status: string;
    new_class: string;
    status: "valid" | "invalid";
    errors?: string[];
}

export default function MultipleStatusChange({ statuses }: Props) {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [newStatus, setNewStatus] = useState<"transferred" | "dropped">(
        "transferred"
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Preview state
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<PreviewData[]>([]);
    const [previewSummary, setPreviewSummary] = useState({
        total: 0,
        valid: 0,
        invalid: 0,
        duplicate_nis: [] as string[],
    });
    const [specialClass, setSpecialClass] = useState("");
    const [academicYearName, setAcademicYearName] = useState("");
    const [isConfirming, setIsConfirming] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            if (errors.file) {
                setErrors({});
            }
        }
    };

    const handleDownloadTemplate = () => {
        window.location.href = route("admin.student-status.template", {
            status: newStatus,
        });
    };

    const handlePreview = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setErrors({ file: "Silakan pilih file Excel terlebih dahulu" });
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("new_status", newStatus);

        try {
            const response = await axios.post(
                route("admin.student-status.preview"),
                formData
            );

            const result = response.data;

            if (result.success) {
                setPreviewData(result.data);
                setPreviewSummary(result.summary);
                setSpecialClass(result.special_class);
                setAcademicYearName(result.academic_year);
                setShowPreview(true);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("Gagal memproses preview data");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmImport = () => {
        setIsConfirming(true);

        const formData = new FormData();
        formData.append("file", file!);
        formData.append("new_status", newStatus);

        router.post(route("admin.student-status.multiple"), formData, {
            onSuccess: () => {
                setFile(null);
                setShowPreview(false);
                setIsConfirming(false);
                // Reset file input
                const fileInput = document.getElementById(
                    "file-upload"
                ) as HTMLInputElement;
                if (fileInput) fileInput.value = "";
                toast.success("Status siswa berhasil diubah");
            },
            onError: (err) => {
                setErrors(err);
                setIsConfirming(false);
                toast.error("Gagal mengubah status siswa");
            },
        });
    };

    const getStatusBadgeVariant = (status: string) => {
        const variants: Record<string, string> = {
            active: "success",
            transferred: "warning",
            dropped: "destructive",
            graduated: "info",
            unknown: "secondary",
        };
        return variants[status] || "secondary";
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            active: "Aktif",
            transferred: "Pindah",
            dropped: "Drop Out",
            graduated: "Lulus",
            unknown: "Tidak Ditemukan",
        };
        return labels[status] || status;
    };

    return (
        <>
            <form onSubmit={handlePreview} className="space-y-6">
                {/* Template Download Section */}
                <Card className="bg-primary-soft border-primary/20">
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-800">
                                    📥 Download Template Excel
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Download template Excel yang berisi contoh
                                    NIS siswa
                                </p>
                                <p className="mt-1 text-xs text-primary">
                                    💡 Template berisi kolom NIS dan Catatan
                                    (opsional)
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="default"
                                onClick={handleDownloadTemplate}
                            >
                                Download Template
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Status Selection */}
                <div className="space-y-3">
                    <Label>
                        Status Tujuan <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                        value={newStatus}
                        onValueChange={(value) => {
                            setNewStatus(value as "transferred" | "dropped");
                            setErrors({});
                        }}
                        className="flex gap-6"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem
                                value="transferred"
                                id="transferred"
                            />
                            <Label
                                htmlFor="transferred"
                                className="cursor-pointer text-orange-600"
                            >
                                {statuses.transferred}
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dropped" id="dropped" />
                            <Label
                                htmlFor="dropped"
                                className="cursor-pointer text-red-600"
                            >
                                {statuses.dropped}
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Upload Section */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="file-upload">
                            File Excel <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-all hover:bg-gray-100">
                            <div className="space-y-2 text-center">
                                <div className="text-4xl">📊</div>
                                <div className="flex text-sm text-gray-600">
                                    <label
                                        htmlFor="file-upload"
                                        className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80"
                                    >
                                        <span>Upload file</span>
                                        <input
                                            id="file-upload"
                                            name="file-upload"
                                            type="file"
                                            className="sr-only"
                                            accept=".xlsx,.xls,.csv"
                                            onChange={handleFileChange}
                                            disabled={loading}
                                        />
                                    </label>
                                    <p className="pl-1">atau drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Excel (XLSX, XLS, CSV) maksimal 10MB
                                </p>
                                {file && (
                                    <div className="mt-2 rounded-lg bg-white p-2">
                                        <p className="text-sm font-medium text-green-600">
                                            ✓ {file.name}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {errors.file && (
                            <p className="text-sm text-red-500">
                                {errors.file}
                            </p>
                        )}
                    </div>
                </div>

                {/* Info Alert */}
                <Alert className="bg-sky border-primary/20">
                    <AlertDescription>
                        <div className="space-y-1 text-sm">
                            <p className="font-semibold">📝 Panduan Import:</p>
                            <ul className="list-inside list-disc space-y-1 pl-2">
                                <li>Download template Excel terlebih dahulu</li>
                                <li>
                                    Isi kolom NIS dengan NIS siswa yang akan
                                    diubah statusnya
                                </li>
                                <li>
                                    Kolom CATATAN bersifat opsional untuk
                                    dokumentasi
                                </li>
                                <li>
                                    Pilih status tujuan (Pindah Sekolah atau
                                    Drop Out)
                                </li>
                                <li>
                                    Hanya siswa dengan status AKTIF yang dapat
                                    diubah
                                </li>
                                <li>
                                    Siswa akan otomatis dipindahkan ke kelas
                                    yang sesuai
                                </li>
                                <li>
                                    NIS yang tidak terdaftar atau tidak aktif
                                    akan ditandai sebagai invalid
                                </li>
                            </ul>
                        </div>
                    </AlertDescription>
                </Alert>

                <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Memproses..." : "Preview Data"}
                    </Button>
                </div>
            </form>

            {/* Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Preview Ubah Status Siswa</DialogTitle>
                        <DialogDescription>
                            Review data siswa sebelum diubah statusnya. Pastikan
                            semua data sudah benar.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Info Status & Class */}
                    <Alert
                        className={`${
                            newStatus === "transferred"
                                ? "bg-orange-50"
                                : "bg-red-50"
                        } border-primary/20`}
                    >
                        <AlertDescription>
                            <div className="space-y-2">
                                <p className="text-sm">
                                    <strong>Status Tujuan:</strong>{" "}
                                    {newStatus === "transferred"
                                        ? statuses.transferred
                                        : statuses.dropped}
                                </p>
                                <p className="text-sm">
                                    <strong>Kelas Tujuan:</strong>{" "}
                                    {specialClass}
                                </p>
                                <p className="text-sm">
                                    <strong>Tahun Ajaran:</strong>{" "}
                                    {academicYearName}
                                </p>
                                <p className="text-sm text-red-600">
                                    ⚠️ Perubahan status ini bersifat permanen.
                                    Siswa akan dipindahkan ke kelas{" "}
                                    {specialClass} dan tidak dapat meminjam buku
                                    baru.
                                </p>
                            </div>
                        </AlertDescription>
                    </Alert>

                    {/* Summary Cards */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Card className="bg-sky border-primary/10">
                            <div className="p-4 text-center">
                                <p className="text-sm text-gray-600">
                                    Total Data
                                </p>
                                <p className="text-2xl font-bold text-primary">
                                    {previewSummary.total}
                                </p>
                            </div>
                        </Card>
                        <Card className="bg-mint border-primary/10">
                            <div className="p-4 text-center">
                                <p className="text-sm text-gray-600">
                                    Data Valid
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {previewSummary.valid}
                                </p>
                            </div>
                        </Card>
                        <Card className="bg-peach border-primary/10">
                            <div className="p-4 text-center">
                                <p className="text-sm text-gray-600">
                                    Data Invalid
                                </p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {previewSummary.invalid}
                                </p>
                            </div>
                        </Card>
                    </div>

                    {/* Duplicate NIS Warning */}
                    {previewSummary.duplicate_nis.length > 0 && (
                        <Alert className="bg-red-50 border-red-200">
                            <AlertDescription>
                                <p className="font-semibold text-red-800">
                                    ⚠️ Peringatan: Duplikasi NIS dalam file!
                                </p>
                                <p className="text-sm text-red-700 mt-1">
                                    NIS berikut muncul lebih dari satu kali
                                    dalam file:{" "}
                                    {previewSummary.duplicate_nis.join(", ")}
                                </p>
                                <p className="text-sm text-red-600 mt-1">
                                    Harap perbaiki file Anda karena NIS harus
                                    unik.
                                </p>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Data Table */}
                    <div className="border rounded-lg overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">
                                        Baris
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>NIS</TableHead>
                                    <TableHead>Nama Siswa</TableHead>
                                    <TableHead>Status Saat Ini</TableHead>
                                    <TableHead>Kelas Saat Ini</TableHead>
                                    <TableHead>Status Baru</TableHead>
                                    <TableHead>Kelas Baru</TableHead>
                                    <TableHead>Catatan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {previewData.map((row) => (
                                    <TableRow
                                        key={row.row_number}
                                        className={
                                            row.status === "invalid"
                                                ? "bg-red-50"
                                                : ""
                                        }
                                    >
                                        <TableCell className="font-medium">
                                            {row.row_number}
                                        </TableCell>
                                        <TableCell>
                                            {row.status === "valid" ? (
                                                <Badge variant="success">
                                                    Valid
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive">
                                                    Invalid
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-mono">
                                            {row.nis}
                                        </TableCell>
                                        <TableCell>
                                            {row.student_name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    getStatusBadgeVariant(
                                                        row.current_status
                                                    ) as any
                                                }
                                            >
                                                {getStatusLabel(
                                                    row.current_status
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {row.current_class !==
                                                "Tidak ditemukan" &&
                                            row.current_class !==
                                                "Belum memiliki kelas" ? (
                                                <Badge variant="info">
                                                    {row.current_class}
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-400 text-xs">
                                                    {row.current_class}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    newStatus === "transferred"
                                                        ? "warning"
                                                        : "destructive"
                                                }
                                            >
                                                {newStatus === "transferred"
                                                    ? statuses.transferred
                                                    : statuses.dropped}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="info">
                                                {row.new_class}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {row.notes || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Error List */}
                    {previewData.some((row) => row.status === "invalid") && (
                        <div className="bg-red-50 rounded-lg p-4">
                            <h4 className="font-semibold text-red-800 mb-2">
                                Daftar Error:
                            </h4>
                            <ul className="list-disc list-inside space-y-1">
                                {previewData
                                    .filter((row) => row.status === "invalid")
                                    .map((row) => (
                                        <li
                                            key={row.row_number}
                                            className="text-sm text-red-700"
                                        >
                                            Baris {row.row_number} (NIS:{" "}
                                            {row.nis}): {row.errors?.join(", ")}
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setShowPreview(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleConfirmImport}
                            disabled={
                                previewSummary.valid === 0 ||
                                previewSummary.duplicate_nis.length > 0 ||
                                isConfirming
                            }
                            className={
                                newStatus === "transferred"
                                    ? "bg-orange-600 hover:bg-orange-700"
                                    : "bg-red-600 hover:bg-red-700"
                            }
                        >
                            {isConfirming
                                ? "Memproses..."
                                : `Ubah ${previewSummary.valid} Siswa menjadi ${
                                      newStatus === "transferred"
                                          ? statuses.transferred
                                          : statuses.dropped
                                  }`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
