// resources/js/Pages/Admin/ClassPromotion/components/MultipleClassPromotion.tsx

import { useState } from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { Card } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
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

interface ClassData {
    id: number;
    name: string;
    level: number;
}

interface Props {
    classes: ClassData[];
}

interface PreviewData {
    row_number: number;
    nis: string;
    student_name: string;
    current_status: string;
    current_status_label: string;
    current_class: string;
    current_class_id: number | null;
    action_type: string;
    new_class_id: number | null;
    target_class: string;
    status: "valid" | "invalid";
    errors?: string[];
}

export default function MultipleClassPromotion({ classes }: Props) {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [actionType, setActionType] = useState<"promote" | "graduate">(
        "promote"
    );
    const [newClassId, setNewClassId] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Preview state
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState<PreviewData[]>([]);
    const [previewSummary, setPreviewSummary] = useState({
        total: 0,
        valid: 0,
        invalid: 0,
    });
    const [academicYearName, setAcademicYearName] = useState("");
    const [specialClass, setSpecialClass] = useState<string | null>(null);
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
        window.location.href = route("admin.class-promotion.template", {
            action_type: actionType,
        });
    };

    const handlePreview = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setErrors({ file: "Silakan pilih file Excel terlebih dahulu" });
            return;
        }

        if (actionType === "promote" && !newClassId) {
            setErrors({ new_class_id: "Silakan pilih kelas tujuan" });
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("action_type", actionType);
        if (actionType === "promote") {
            formData.append("new_class_id", newClassId);
        }

        try {
            const response = await axios.post(
                route("admin.class-promotion.preview"),
                formData
            );

            const result = response.data;

            if (result.success) {
                setPreviewData(result.data);
                setPreviewSummary(result.summary);
                setAcademicYearName(result.academic_year);
                setSpecialClass(result.special_class || null);
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
        formData.append("action_type", actionType);
        if (actionType === "promote") {
            formData.append("new_class_id", newClassId);
        }

        router.post(route("admin.class-promotion.multiple"), formData, {
            onSuccess: () => {
                setFile(null);
                setNewClassId("");
                setShowPreview(false);
                setIsConfirming(false);
                // Reset file input
                const fileInput = document.getElementById(
                    "file-upload"
                ) as HTMLInputElement;
                if (fileInput) fileInput.value = "";
                toast.success(
                    actionType === "graduate"
                        ? "Data siswa berhasil diluluskan"
                        : "Data siswa berhasil dipromosikan"
                );
            },
            onError: (err) => {
                setErrors(err);
                setIsConfirming(false);
                toast.error(
                    actionType === "graduate"
                        ? "Data siswa gagal diluluskan"
                        : "Data siswa gagal dipromosikan"
                );
            },
        });
    };

    const getNewClassName = () => {
        if (actionType === "graduate") {
            return "graduated";
        }
        const classObj = classes.find((c) => c.id.toString() === newClassId);
        return classObj ? classObj.name : "";
    };

    const getStatusBadgeVariant = (status: string) => {
        const variants: Record<string, string> = {
            active: "success",
            graduated: "info",
            transferred: "warning",
            dropped: "destructive",
            unknown: "secondary",
        };
        return variants[status] || "secondary";
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            active: "Aktif",
            graduated: "Lulus",
            transferred: "Pindah",
            dropped: "Drop Out",
            unknown: "Tidak Diketahui",
        };
        return labels[status] || status;
    };

    const getActionBadgeVariant = () => {
        return actionType === "graduate" ? "info" : "success";
    };

    const getActionLabel = () => {
        return actionType === "graduate" ? "Lulus" : "Naik Kelas";
    };

    const getTargetClassBadgeVariant = () => {
        return actionType === "graduate" ? "info" : "success";
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
                                    💡 Template hanya berisi kolom NIS
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

                {/* Action Type Selection */}
                <div className="space-y-3">
                    <Label>Aksi yang akan dilakukan</Label>
                    <RadioGroup
                        value={actionType}
                        onValueChange={(value) => {
                            setActionType(value as "promote" | "graduate");
                            setNewClassId("");
                            setErrors({});
                        }}
                        className="flex gap-6"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="promote" id="promote" />
                            <Label htmlFor="promote" className="cursor-pointer">
                                Naik Kelas
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="graduate" id="graduate" />
                            <Label
                                htmlFor="graduate"
                                className="cursor-pointer"
                            >
                                Lulus
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Upload Section */}
                <div className="space-y-4">
                    {actionType === "promote" && (
                        <div className="space-y-2">
                            <Label htmlFor="new_class_id">
                                Kelas Tujuan{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={newClassId}
                                onValueChange={(value) => {
                                    setNewClassId(value);
                                    if (errors.new_class_id) setErrors({});
                                }}
                            >
                                <SelectTrigger
                                    className={
                                        errors.new_class_id
                                            ? "border-red-500"
                                            : ""
                                    }
                                >
                                    <SelectValue placeholder="Pilih kelas tujuan untuk semua siswa" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes
                                        .filter((cls) => cls.level !== 0) // Filter out special classes
                                        .map((cls) => (
                                            <SelectItem
                                                key={cls.id}
                                                value={cls.id.toString()}
                                            >
                                                Kelas {cls.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            {errors.new_class_id && (
                                <p className="text-sm text-red-500">
                                    {errors.new_class_id}
                                </p>
                            )}
                        </div>
                    )}

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
                                    diproses
                                </li>
                                {actionType === "promote" ? (
                                    <>
                                        <li>
                                            Pilih kelas tujuan untuk semua siswa
                                            dalam file
                                        </li>
                                        <li>
                                            Sistem akan menggunakan Tahun Ajaran
                                            yang sedang aktif
                                        </li>
                                        <li>
                                            Siswa yang sudah berada di kelas
                                            tujuan akan diabaikan
                                        </li>
                                        <li>
                                            Hanya siswa dengan status AKTIF yang
                                            bisa dipromosikan
                                        </li>
                                        <li>
                                            Tidak dapat memindahkan siswa ke
                                            kelas khusus (graduated,
                                            transferred, dropped)
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li>
                                            Hanya siswa dengan status AKTIF yang
                                            bisa diluluskan
                                        </li>
                                        <li>
                                            Siswa lulus akan otomatis diubah
                                            statusnya menjadi LULUS
                                        </li>
                                        <li>
                                            Siswa lulus akan dipindahkan ke
                                            kelas "graduated"
                                        </li>
                                        <li>
                                            Siswa tidak dapat meminjam buku
                                            setelah lulus
                                        </li>
                                    </>
                                )}
                                <li>
                                    NIS yang tidak terdaftar akan ditandai
                                    sebagai invalid
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
                        <DialogTitle>
                            {actionType === "graduate"
                                ? "Preview Kelulusan"
                                : "Preview Naik Kelas"}
                        </DialogTitle>
                        <DialogDescription>
                            Review data siswa sebelum diproses. Pastikan semua
                            data sudah benar.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Info Academic Year & Target Class */}
                    {actionType === "graduate" ? (
                        <Alert className="bg-lavender border-primary/20">
                            <AlertDescription>
                                <div className="space-y-2">
                                    <p className="text-sm">
                                        <strong>Tahun Ajaran Aktif:</strong>{" "}
                                        {academicYearName}
                                    </p>
                                    <p className="text-sm">
                                        <strong>Aksi:</strong> Meluluskan siswa
                                    </p>
                                    <p className="text-sm">
                                        <strong>Kelas Tujuan:</strong> graduated
                                    </p>
                                    <p className="text-sm text-purple-600 mt-2">
                                        🎓 Siswa yang diluluskan akan:
                                        <ul className="list-disc list-inside ml-4 mt-1">
                                            <li>Status diubah menjadi LULUS</li>
                                            <li>
                                                Dipindahkan ke kelas "graduated"
                                            </li>
                                            <li>
                                                Tidak dapat meminjam buku lagi
                                            </li>
                                        </ul>
                                    </p>
                                </div>
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert className="bg-primary-soft border-primary/20">
                            <AlertDescription>
                                <p className="text-sm">
                                    <strong>Tahun Ajaran Aktif:</strong>{" "}
                                    {academicYearName}
                                </p>
                                <p className="text-sm mt-1">
                                    <strong>Kelas Tujuan:</strong>{" "}
                                    {getNewClassName()}
                                </p>
                            </AlertDescription>
                        </Alert>
                    )}

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
                                    <TableHead>Aksi</TableHead>
                                    <TableHead>Kelas Tujuan</TableHead>
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
                                                variant={getActionBadgeVariant()}
                                            >
                                                {getActionLabel()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={getTargetClassBadgeVariant()}
                                            >
                                                {actionType === "graduate"
                                                    ? "graduated"
                                                    : getNewClassName()}
                                            </Badge>
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
                                previewSummary.valid === 0 || isConfirming
                            }
                            className={
                                actionType === "graduate"
                                    ? "bg-purple-600 hover:bg-purple-700"
                                    : "bg-primary hover:bg-primary/90"
                            }
                        >
                            {isConfirming
                                ? "Memproses..."
                                : actionType === "graduate"
                                ? `Luluskan ${previewSummary.valid} Siswa`
                                : `Promosikan ${
                                      previewSummary.valid
                                  } Siswa ke Kelas ${getNewClassName()}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
