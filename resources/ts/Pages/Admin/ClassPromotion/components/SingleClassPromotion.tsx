// resources/js/Pages/Admin/ClassPromotion/components/SingleClassPromotion.tsx

import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Card } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { toast } from "sonner";
import { debounce } from "lodash";
import axios from "axios";

interface ClassData {
    id: number;
    name: string;
    level: number;
}

interface Props {
    classes: ClassData[];
}

interface StudentSearchResult {
    id: number;
    student_id: number;
    name: string;
    nis: string;
    status: string;
    status_label: string;
    current_class: string;
    current_class_id: number | null;
    can_promote: boolean;
    can_graduate: boolean;
}

export default function SingleClassPromotion({ classes }: Props) {
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [students, setStudents] = useState<StudentSearchResult[]>([]);
    const [selectedStudent, setSelectedStudent] =
        useState<StudentSearchResult | null>(null);
    const [actionType, setActionType] = useState<"promote" | "graduate">(
        "promote"
    );
    const [newClassId, setNewClassId] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showStudentInfo, setShowStudentInfo] = useState(false);

    // Debounced search function
    const searchStudents = debounce(async (search: string) => {
        if (search.length < 2) {
            setStudents([]);
            return;
        }

        setSearching(true);
        try {
            const response = await axios.get(
                route("admin.class-promotion.search"),
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

        // Auto-select action type based on student status
        if (student.can_graduate && !student.can_promote) {
            setActionType("graduate");
        } else if (student.can_promote) {
            setActionType("promote");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedStudent) {
            setErrors({ student: "Silakan pilih siswa terlebih dahulu" });

            return;
        }

        if (actionType === "promote" && !newClassId) {
            setErrors({ new_class_id: "Silakan pilih kelas tujuan" });
            return;
        }

        setLoading(true);

        const payload: any = {
            student_id: selectedStudent.student_id,
            action_type: actionType,
        };

        if (actionType === "promote") {
            payload.new_class_id = newClassId;
        }

        router.post(route("admin.class-promotion.single"), payload, {
            onSuccess: () => {
                setSelectedStudent(null);
                setNewClassId("");
                setShowStudentInfo(false);
                setActionType("promote");
                toast.success(
                    actionType === "graduate"
                        ? "Siswa berhasil diluluskan"
                        : "Siswa berhasil dipromosikan"
                );
                setLoading(false);
            },
            onError: (err) => {
                setErrors(err);
                setLoading(false);
                toast.error(
                    actionType === "graduate"
                        ? "Gagal meluluskan siswa"
                        : "Gagal mempromosikan siswa"
                );
            },
        });
    };

    const resetForm = () => {
        setSelectedStudent(null);
        setNewClassId("");
        setShowStudentInfo(false);
        setSearchTerm("");
        setStudents([]);
        setErrors({});
        setActionType("promote");
    };

    const getNewClassName = () => {
        const classObj = classes.find((c) => c.id.toString() === newClassId);
        return classObj ? classObj.name : "";
    };

    const getStatusBadgeVariant = (status: string) => {
        const variants: Record<string, string> = {
            active: "success",
            graduated: "info",
            transferred: "warning",
            dropped: "destructive",
        };
        return variants[status] || "secondary";
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Info Alert */}
            <Alert className="bg-sky border-primary/20">
                <AlertDescription className="text-sm">
                    ℹ️ Pilih aksi yang sesuai untuk siswa:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>
                            <strong>Naik Kelas</strong> - Memindahkan siswa ke
                            kelas yang lebih tinggi (hanya untuk siswa AKTIF)
                        </li>
                        <li>
                            <strong>Lulus</strong> - Mengubah status siswa
                            menjadi LULUS (tidak memerlukan pemilihan kelas)
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
                        placeholder="Cari berdasarkan NIS atau Nama siswa..."
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
                                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                        <span>NIS: {student.nis}</span>
                                        <Badge
                                            variant={
                                                getStatusBadgeVariant(
                                                    student.status
                                                ) as any
                                            }
                                        >
                                            {student.status_label}
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
                                <p className="text-sm text-gray-600">Status</p>
                                <Badge
                                    variant={
                                        getStatusBadgeVariant(
                                            selectedStudent.status
                                        ) as any
                                    }
                                >
                                    {selectedStudent.status_label}
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

            {/* Action Type Selection - Only show if student can be promoted or graduated */}
            {showStudentInfo &&
                selectedStudent &&
                (selectedStudent.can_promote ||
                    selectedStudent.can_graduate) && (
                    <div className="space-y-3">
                        <Label>Aksi yang akan dilakukan</Label>
                        <RadioGroup
                            value={actionType}
                            onValueChange={(value) =>
                                setActionType(value as "promote" | "graduate")
                            }
                            className="flex gap-6"
                        >
                            {selectedStudent.can_promote && (
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="promote"
                                        id="promote"
                                    />
                                    <Label
                                        htmlFor="promote"
                                        className="cursor-pointer"
                                    >
                                        Naik Kelas
                                    </Label>
                                </div>
                            )}
                            {selectedStudent.can_graduate && (
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="graduate"
                                        id="graduate"
                                    />
                                    <Label
                                        htmlFor="graduate"
                                        className="cursor-pointer"
                                    >
                                        Lulus
                                    </Label>
                                </div>
                            )}
                        </RadioGroup>
                    </div>
                )}

            {/* New Class Selection - Only for promotion */}
            {showStudentInfo && selectedStudent && actionType === "promote" && (
                <div className="space-y-2">
                    <Label htmlFor="new_class_id">
                        Kelas Tujuan <span className="text-red-500">*</span>
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
                                errors.new_class_id ? "border-red-500" : ""
                            }
                        >
                            <SelectValue placeholder="Pilih kelas tujuan" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map((cls) => (
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

            {/* Summary */}
            {showStudentInfo && selectedStudent && (
                <Card
                    className={`p-4 ${
                        actionType === "graduate" ? "bg-lavender" : "bg-mint"
                    } border-primary/10`}
                >
                    <h3 className="font-semibold text-gray-800 mb-2">
                        {actionType === "graduate"
                            ? "Ringkasan Kelulusan"
                            : "Ringkasan Naik Kelas"}
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Siswa:</span>
                            <span className="font-medium">
                                {selectedStudent.name}
                            </span>
                        </div>
                        {actionType === "graduate" ? (
                            <>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">
                                        Status Awal:
                                    </span>
                                    <Badge
                                        variant={
                                            getStatusBadgeVariant(
                                                selectedStudent.status
                                            ) as any
                                        }
                                    >
                                        {selectedStudent.status_label}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">
                                        Status Akhir:
                                    </span>
                                    <Badge variant="info">Lulus</Badge>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>Tahun Ajaran:</span>
                                    <span>Mengikuti tahun ajaran aktif</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">
                                        Dari Kelas:
                                    </span>
                                    <Badge variant="info">
                                        {selectedStudent.current_class}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">
                                        Ke Kelas:
                                    </span>
                                    <Badge variant="success">
                                        {getNewClassName() || "Belum dipilih"}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>Tahun Ajaran:</span>
                                    <span>Mengikuti tahun ajaran aktif</span>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            )}

            {/* Warning for non-actionable students */}
            {showStudentInfo &&
                selectedStudent &&
                !selectedStudent.can_promote &&
                !selectedStudent.can_graduate && (
                    <Alert className="bg-peach border-primary/20">
                        <AlertDescription>
                            <p className="text-sm">
                                ⚠️ Siswa dengan status{" "}
                                <strong>{selectedStudent.status_label}</strong>{" "}
                                tidak dapat dipromosikan atau diluluskan.
                                {selectedStudent.status === "graduated" &&
                                    " Siswa sudah lulus."}
                                {selectedStudent.status === "transferred" &&
                                    " Siswa sudah pindah."}
                                {selectedStudent.status === "dropped" &&
                                    " Siswa sudah drop out."}
                            </p>
                        </AlertDescription>
                    </Alert>
                )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
                <Button type="button" variant="secondary" onClick={resetForm}>
                    Reset
                </Button>
                <Button
                    type="submit"
                    disabled={
                        loading ||
                        !selectedStudent ||
                        (actionType === "promote" && !newClassId) ||
                        (actionType === "graduate" &&
                            !selectedStudent.can_graduate) ||
                        (actionType === "promote" &&
                            !selectedStudent.can_promote)
                    }
                >
                    {loading
                        ? "Memproses..."
                        : actionType === "graduate"
                        ? "Luluskan Siswa"
                        : "Promosikan Siswa"}
                </Button>
            </div>
        </form>
    );
}
