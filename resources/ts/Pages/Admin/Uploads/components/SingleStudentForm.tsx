// resources/js/Pages/Admin/Uploads/components/SingleStudentForm.tsx

import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Textarea } from "@/Components/ui/textarea";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/Components/ui/alert";

interface ClassData {
    id: number;
    name: string;
    level: number;
}

interface AcademicYear {
    id: number;
    name: string;
    is_active: boolean;
}

interface Props {
    classes: ClassData[];
    academicYears: AcademicYear[];
    activeAcademicYear: AcademicYear | null;
}

export default function SingleStudentForm({
    classes,
    academicYears,
    activeAcademicYear,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        nis: "",
        gender: "",
        class_id: "",
        academic_year_id: activeAcademicYear?.id || "",
        parent_phone: "",
        address: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Auto-generate email when NIS changes
    useEffect(() => {
        if (formData.nis && formData.nis.trim() !== "") {
            const generatedEmail = `student.${formData.nis}@mtsn39.com`;
            setFormData((prev) => ({ ...prev, email: generatedEmail }));
        } else {
            setFormData((prev) => ({ ...prev, email: "" }));
        }
    }, [formData.nis]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        router.post(route("admin.students.single"), formData, {
            onSuccess: (page) => {
                setFormData({
                    name: "",
                    email: "",
                    nis: "",
                    gender: "",
                    class_id: "",
                    academic_year_id: activeAcademicYear?.id || "",
                    parent_phone: "",
                    address: "",
                });
                toast.success("Data berhasil disimpan");
                setLoading(false);
            },
            onError: (err) => {
                setErrors(err);
                setLoading(false);
                toast.error("Data gagal disimpan");
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Info Alert */}
            <Alert className="bg-sky border-primary/20">
                <AlertDescription className="text-sm">
                    💡 Email akan dibuat OTOMATIS dari NIS:{" "}
                    <strong>student.[NIS]@mtsn39.com</strong>
                </AlertDescription>
            </Alert>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Name */}
                <div className="space-y-2">
                    <Label htmlFor="name">
                        Nama Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Masukkan nama lengkap"
                        className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                </div>

                {/* NIS */}
                <div className="space-y-2">
                    <Label htmlFor="nis">
                        NIS <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="nis"
                        name="nis"
                        value={formData.nis}
                        onChange={handleChange}
                        placeholder="Nomor Induk Siswa"
                        className={errors.nis ? "border-red-500" : ""}
                    />
                    <p className="text-xs text-gray-500">
                        Password akan menggunakan NIS ini
                    </p>
                    {errors.nis && (
                        <p className="text-sm text-red-500">{errors.nis}</p>
                    )}
                </div>

                {/* Email - Auto-generated and Readonly */}
                <div className="space-y-2">
                    <Label htmlFor="email">
                        Email (Auto Generated){" "}
                        <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        readOnly
                        className="bg-gray-100 cursor-not-allowed"
                        placeholder="Email akan otomatis terisi"
                    />
                    <p className="text-xs text-primary">
                        Email otomatis dibuat dari NIS
                    </p>
                    {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                </div>

                {/* Gender */}
                <div className="space-y-2">
                    <Label htmlFor="gender">
                        Jenis Kelamin <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                            handleSelectChange("gender", value)
                        }
                    >
                        <SelectTrigger
                            className={errors.gender ? "border-red-500" : ""}
                        >
                            <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Laki-laki</SelectItem>
                            <SelectItem value="female">Perempuan</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.gender && (
                        <p className="text-sm text-red-500">{errors.gender}</p>
                    )}
                </div>

                {/* Class */}
                <div className="space-y-2">
                    <Label htmlFor="class_id">
                        Kelas <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.class_id}
                        onValueChange={(value) =>
                            handleSelectChange("class_id", value)
                        }
                    >
                        <SelectTrigger
                            className={errors.class_id ? "border-red-500" : ""}
                        >
                            <SelectValue placeholder="Pilih kelas" />
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
                    {errors.class_id && (
                        <p className="text-sm text-red-500">
                            {errors.class_id}
                        </p>
                    )}
                </div>

                {/* Academic Year */}
                <div className="space-y-2">
                    <Label htmlFor="academic_year_id">
                        Tahun Ajaran <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.academic_year_id as any}
                        onValueChange={(value) =>
                            handleSelectChange("academic_year_id", value)
                        }
                    >
                        <SelectTrigger
                            className={
                                errors.academic_year_id ? "border-red-500" : ""
                            }
                        >
                            <SelectValue placeholder="Pilih tahun ajaran" />
                        </SelectTrigger>
                        <SelectContent>
                            {academicYears.map((year) => (
                                <SelectItem
                                    key={year.id}
                                    value={year.id.toString()}
                                >
                                    {year.name} {year.is_active && "(Aktif)"}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.academic_year_id && (
                        <p className="text-sm text-red-500">
                            {errors.academic_year_id}
                        </p>
                    )}
                </div>

                {/* Parent Phone */}
                <div className="space-y-2">
                    <Label htmlFor="parent_phone">No. HP Orang Tua</Label>
                    <Input
                        id="parent_phone"
                        name="parent_phone"
                        value={formData.parent_phone}
                        onChange={handleChange}
                        placeholder="Nomor telepon orang tua"
                    />
                </div>

                {/* Address */}
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Alamat</Label>
                    <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Alamat lengkap siswa"
                        rows={3}
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-3">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                        setFormData({
                            name: "",
                            email: "",
                            nis: "",
                            gender: "",
                            class_id: "",
                            academic_year_id: activeAcademicYear?.id || "",
                            parent_phone: "",
                            address: "",
                        });
                    }}
                >
                    Reset
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Menyimpan..." : "Simpan Siswa"}
                </Button>
            </div>
        </form>
    );
}
