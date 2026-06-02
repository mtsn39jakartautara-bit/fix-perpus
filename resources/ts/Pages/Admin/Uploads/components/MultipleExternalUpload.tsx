// resources/js/Pages/Admin/Uploads/components/MultipleExternalUpload.tsx

import { useState } from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
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

interface PreviewData {
    row_number: number;
    name: string;
    nik: string;
    email: string;
    gender: string;
    number_phone: string;
    status: "valid" | "invalid";
    errors?: string[];
    is_new_nik?: boolean;
    is_new_email?: boolean;
}

export default function MultipleExternalUpload() {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Preview state
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<PreviewData[]>([]);
    const [previewSummary, setPreviewSummary] = useState({
        total: 0,
        valid: 0,
        invalid: 0,
        duplicate_nik: [] as string[],
    });
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
        window.location.href = route("admin.externals.template");
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

        try {
            const response = await axios.post(
                route("admin.externals.preview"),
                formData
            );

            const result = response.data;

            if (result.success) {
                setPreviewData(result.data);
                setPreviewSummary(result.summary);
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

        router.post(route("admin.externals.multiple"), formData, {
            onSuccess: () => {
                setFile(null);
                setShowPreview(false);
                setIsConfirming(false);
                // Reset file input
                const fileInput = document.getElementById(
                    "file-upload"
                ) as HTMLInputElement;
                if (fileInput) fileInput.value = "";
                toast.success("Data pengguna eksternal berhasil diupload");
            },
            onError: (err) => {
                setErrors(err);
                setIsConfirming(false);
                toast.error("Data pengguna eksternal gagal diupload");
            },
        });
    };

    const getGenderLabel = (gender: string) => {
        return gender === "male" ? "Laki-laki" : "Perempuan";
    };

    const getGenderBadgeVariant = (gender: string) => {
        return gender === "male" ? "default" : "secondary";
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
                                    Download template Excel yang berisi 5 contoh
                                    data pengguna eksternal
                                </p>
                                <p className="mt-1 text-xs text-primary">
                                    💡 Email akan otomatis dibuat dari NIK:
                                    external.[NIK]@mtsn39.com
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
                                    Isi data sesuai dengan format yang tersedia
                                </li>
                                <li>
                                    Kolom NAMA, NIK, dan JENIS_KELAMIN wajib
                                    diisi
                                </li>
                                <li>
                                    Email akan dibuat OTOMATIS:
                                    external.[NIK]@mtsn39.com
                                </li>
                                <li>
                                    Jenis kelamin harus "male" atau "female"
                                </li>
                                <li>Password akan menggunakan NIK</li>
                                <li>NIK harus unik (belum terdaftar)</li>
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
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Preview Data Pengguna Eksternal
                        </DialogTitle>
                        <DialogDescription>
                            Review data pengguna eksternal sebelum diimport.
                            Pastikan semua data sudah benar.
                        </DialogDescription>
                    </DialogHeader>

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

                    {/* Duplicate NIK Warning */}
                    {previewSummary.duplicate_nik.length > 0 && (
                        <Alert className="bg-red-50 border-red-200">
                            <AlertDescription>
                                <p className="font-semibold text-red-800">
                                    ⚠️ Peringatan: Duplikasi NIK dalam file!
                                </p>
                                <p className="text-sm text-red-700 mt-1">
                                    NIK berikut muncul lebih dari satu kali
                                    dalam file:{" "}
                                    {previewSummary.duplicate_nik.join(", ")}
                                </p>
                                <p className="text-sm text-red-600 mt-1">
                                    Harap perbaiki file Anda karena NIK harus
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
                                    <TableHead>Nama</TableHead>
                                    <TableHead>NIK</TableHead>
                                    <TableHead>Email (Auto)</TableHead>
                                    <TableHead>Jenis Kelamin</TableHead>
                                    <TableHead>No. HP</TableHead>
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
                                                <Badge variant="secondary">
                                                    Valid
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive">
                                                    Invalid
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>
                                            <span
                                                className={
                                                    !row.is_new_nik
                                                        ? "text-orange-600 font-medium"
                                                        : ""
                                                }
                                            >
                                                {row.nik}
                                                {!row.is_new_nik && (
                                                    <span className="text-xs ml-1">
                                                        (duplikat)
                                                    </span>
                                                )}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-xs font-mono">
                                            {row.email}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={getGenderBadgeVariant(
                                                    row.gender
                                                )}
                                            >
                                                {getGenderLabel(row.gender)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {row.number_phone || "-"}
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
                                            Baris {row.row_number}:{" "}
                                            {row.errors?.join(", ")}
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
                                previewSummary.duplicate_nik.length > 0 ||
                                isConfirming
                            }
                        >
                            {isConfirming
                                ? "Mengimport..."
                                : `Import ${previewSummary.valid} Data Valid`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
