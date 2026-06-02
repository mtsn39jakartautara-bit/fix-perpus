// resources/js/Pages/Admin/StudentStatus/components/SingleStatusChange.tsx

import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { Card } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { toast } from "sonner";
import { debounce } from "lodash";
import axios from "axios";

interface Statuses {
    transferred: string;
    dropped: string;
}

interface Props {
    statuses: Statuses;
}

interface StudentSearchResult {
    id: number;
    student_id: number;
    name: string;
    nis: string;
    current_status: string;
    current_class: string;
    current_class_id: number | null;
}

interface SpecialClass {
    id: number;
    name: string;
    level: number;
}

export default function SingleStatusChange({ statuses }: Props) {
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [students, setStudents] = useState<StudentSearchResult[]>([]);
    const [selectedStudent, setSelectedStudent] =
        useState<StudentSearchResult | null>(null);
    const [newStatus, setNewStatus] = useState<"transferred" | "dropped">(
        "transferred"
    );
    const [notes, setNotes] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showStudentInfo, setShowStudentInfo] = useState(false);
    const [specialClass, setSpecialClass] = useState<SpecialClass | null>(null);
    const [loadingClass, setLoadingClass] = useState(false);

    // Debounced search function
    const searchStudents = debounce(async (search: string) => {
        if (search.length < 2) {
            setStudents([]);
            return;
        }

        setSearching(true);
        try {
            const response = await axios.get(
                route("admin.student-status.search"),
                {
                    params: { search },
                }
            );
            setStudents(response.data);
        } catch (error) {
            console.error("Error searching students:", error);
            toast.error("Gagal mencari siswa");
        } finally {
            setSearching(false);
        }
    }, 500);

    // Fetch special class info when status changes
    useEffect(() => {
        const fetchSpecialClass = async () => {
            setLoadingClass(true);
            try {
                const response = await axios.get(
                    route("admin.classes.by-name", { name: newStatus })
                );
                setSpecialClass(response.data);
            } catch (error) {
                console.error("Error fetching special class:", error);
            } finally {
                setLoadingClass(false);
            }
        };

        if (newStatus) {
            fetchSpecialClass();
        }
    }, [newStatus]);

    useEffect(() => {
        searchStudents(searchTerm);
        return () => {
            searchStudents.cancel();
        };
    }, [searchTerm]);

    const handleSelectStudent = (student: StudentSearchResult) => {
        setSelectedStudent(student);
        setShowStudentInfo(true);
        setSearchTerm("");
        setStudents([]);
        setErrors({});
        setNotes("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedStudent) {
            setErrors({ student: "Silakan pilih siswa terlebih dahulu" });
            return;
        }

        setLoading(true);

        router.post(
            route("admin.student-status.single"),
            {
                student_id: selectedStudent.student_id,
                new_status: newStatus,
                notes: notes,
            },
            {
                onSuccess: () => {
                    setSelectedStudent(null);
                    setShowStudentInfo(false);
                    setNewStatus("transferred");
                    setNotes("");
                    toast.success("Status siswa berhasil diubah");
                    setLoading(false);
                },
                onError: (err) => {
                    setErrors(err);
                    setLoading(false);
                    toast.error("Gagal mengubah status siswa");
                },
            }
        );
    };

    const resetForm = () => {
        setSelectedStudent(null);
        setShowStudentInfo(false);
        setSearchTerm("");
        setStudents([]);
        setErrors({});
        setNewStatus("transferred");
        setNotes("");
    };

    const getStatusBadgeVariant = (status: string) => {
        const variants: Record<string, string> = {
            active: "success",
            transferred: "warning",
            dropped: "destructive",
            graduated: "info",
        };
        return variants[status] || "secondary";
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            active: "Aktif",
            transferred: "Pindah",
            dropped: "Drop Out",
            graduated: "Lulus",
        };
        return labels[status] || status;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Info Alert */}
            <Alert className="bg-sky border-primary/20">
                <AlertDescription className="text-sm">
                    ⚠️ Peringatan: Mengubah status siswa akan mempengaruhi akses
                    mereka ke sistem perpustakaan.
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>
                            <strong>Pindah Sekolah</strong> - Siswa akan
                            dipindahkan ke kelas "transferred"
                        </li>
                        <li>
                            <strong>Drop Out</strong> - Siswa akan dipindahkan
                            ke kelas "dropped"
                        </li>
                        <li>
                            Siswa tidak dapat meminjam buku baru setelah status
                            berubah
                        </li>
                    </ul>
                </AlertDescription>
            </Alert>

            {/* Search Student */}
            <div className="space-y-2">
                <Label htmlFor="search">
                    Cari Siswa <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                    <Input
                        id="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari berdasarkan NIS atau Nama siswa (hanya siswa aktif)..."
                        className={errors.student ? "border-red-500" : ""}
                    />
                    {searching && (
                        <div className="absolute right-3 top-2 text-gray-400">
                            Mencari...
                        </div>
                    )}
                </div>

                {/* Search Results */}
                {students.length > 0 && searchTerm.length >= 2 && (
                    <Card className="absolute z-10 w-full max-h-60 overflow-y-auto shadow-lg">
                        <div className="divide-y">
                            {students.map((student) => (
                                <button
                                    key={student.id}
                                    type="button"
                                    onClick={() => handleSelectStudent(student)}
                                    className="w-full p-3 text-left hover:bg-primary-soft transition-colors"
                                >
                                    <div className="font-medium">
                                        {student.name}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1 flex-wrap">
                                        <span>NIS: {student.nis}</span>
                                        <Badge
                                            variant={
                                                getStatusBadgeVariant(
                                                    student.current_status
                                                ) as any
                                            }
                                        >
                                            {getStatusLabel(
                                                student.current_status
                                            )}
                                        </Badge>
                                        <span>
                                            Kelas: {student.current_class}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </Card>
                )}

                {errors.student && (
                    <p className="text-sm text-red-500">{errors.student}</p>
                )}
            </div>

            {/* Selected Student Info */}
            {showStudentInfo && selectedStudent && (
                <Card className="bg-primary-soft border-primary/20 p-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800">
                                Siswa Terpilih
                            </h3>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={resetForm}
                            >
                                Ganti
                            </Button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <p className="text-sm text-gray-600">Nama</p>
                                <p className="font-medium">
                                    {selectedStudent.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">NIS</p>
                                <p className="font-medium">
                                    {selectedStudent.nis}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    Status Saat Ini
                                </p>
                                <Badge
                                    variant={
                                        getStatusBadgeVariant(
                                            selectedStudent.current_status
                                        ) as any
                                    }
                                >
                                    {getStatusLabel(
                                        selectedStudent.current_status
                                    )}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    Kelas Saat Ini
                                </p>
                                <Badge variant="info">
                                    {selectedStudent.current_class}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* New Status Selection */}
            {showStudentInfo && selectedStudent && (
                <div className="space-y-3">
                    <Label>
                        Status Baru <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                        value={newStatus}
                        onValueChange={(value) =>
                            setNewStatus(value as "transferred" | "dropped")
                        }
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
                    {specialClass && (
                        <p className="text-xs text-muted-foreground mt-1">
                            📌 Siswa akan dipindahkan ke kelas:{" "}
                            <strong>{specialClass.name}</strong>
                        </p>
                    )}
                </div>
            )}

            {/* Notes (Optional) */}
            {showStudentInfo && selectedStudent && (
                <div className="space-y-2">
                    <Label htmlFor="notes">Catatan (Opsional)</Label>
                    <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Tambahkan catatan tentang perubahan status ini (alasan pindah/drop out, dll)..."
                        rows={3}
                    />
                </div>
            )}

            {/* Summary */}
            {showStudentInfo && selectedStudent && (
                <Card
                    className={`p-4 ${
                        newStatus === "transferred"
                            ? "bg-orange-50"
                            : "bg-red-50"
                    } border-primary/10`}
                >
                    <h3 className="font-semibold text-gray-800 mb-2">
                        Ringkasan Perubahan Status
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Siswa:</span>
                            <span className="font-medium">
                                {selectedStudent.name}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">NIS:</span>
                            <span className="font-mono">
                                {selectedStudent.nis}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Status Awal:</span>
                            <Badge
                                variant={
                                    getStatusBadgeVariant(
                                        selectedStudent.current_status
                                    ) as any
                                }
                            >
                                {getStatusLabel(selectedStudent.current_status)}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Kelas Awal:</span>
                            <Badge variant="info">
                                {selectedStudent.current_class}
                            </Badge>
                        </div>
                        <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">
                                    Status Baru:
                                </span>
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
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-gray-600">
                                    Kelas Baru:
                                </span>
                                <Badge variant="info">
                                    {loadingClass
                                        ? "Memuat..."
                                        : specialClass?.name || newStatus}
                                </Badge>
                            </div>
                        </div>
                        {notes && (
                            <div className="border-t pt-2 mt-2">
                                <p className="text-sm text-gray-600">
                                    Catatan:
                                </p>
                                <p className="text-sm mt-1">{notes}</p>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
                <Button type="button" variant="secondary" onClick={resetForm}>
                    Reset
                </Button>
                <Button
                    type="submit"
                    disabled={loading || !selectedStudent || loadingClass}
                    className={
                        newStatus === "transferred"
                            ? "bg-orange-600 hover:bg-orange-700"
                            : "bg-red-600 hover:bg-red-700"
                    }
                >
                    {loading ? "Memproses..." : "Ubah Status"}
                </Button>
            </div>
        </form>
    );
}
