// resources/js/Pages/Admin/Uploads/components/SingleExternalForm.tsx

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
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/Components/ui/alert";

export default function SingleExternalForm() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        nik: "",
        gender: "",
        number_phone: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Auto-generate email when NIK changes
    useEffect(() => {
        if (formData.nik && formData.nik.trim() !== "") {
            const generatedEmail = `external.${formData.nik}@mtsn39.com`;
            setFormData((prev) => ({ ...prev, email: generatedEmail }));
        } else {
            setFormData((prev) => ({ ...prev, email: "" }));
        }
    }, [formData.nik]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        router.post(route("admin.externals.single"), formData, {
            onSuccess: () => {
                setFormData({
                    name: "",
                    email: "",
                    nik: "",
                    gender: "",
                    number_phone: "",
                });
                toast.success("Data pengguna eksternal berhasil disimpan");
                setLoading(false);
            },
            onError: (err) => {
                setErrors(err);
                setLoading(false);
                toast.error("Data pengguna eksternal gagal disimpan");
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Info Alert */}
            <Alert className="bg-sky border-primary/20">
                <AlertDescription className="text-sm">
                    💡 Email akan dibuat OTOMATIS dari NIK:{" "}
                    <strong>external.[NIK]@mtsn39.com</strong>
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

                {/* NIK */}
                <div className="space-y-2">
                    <Label htmlFor="nik">
                        NIK <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="nik"
                        name="nik"
                        value={formData.nik}
                        onChange={handleChange}
                        placeholder="Nomor Induk Kependudukan"
                        className={errors.nik ? "border-red-500" : ""}
                    />
                    <p className="text-xs text-gray-500">
                        Password akan menggunakan NIK ini
                    </p>
                    {errors.nik && (
                        <p className="text-sm text-red-500">{errors.nik}</p>
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
                        Email otomatis dibuat dari NIK
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

                {/* Phone Number */}
                <div className="space-y-2">
                    <Label htmlFor="number_phone">No. HP</Label>
                    <Input
                        id="number_phone"
                        name="number_phone"
                        value={formData.number_phone}
                        onChange={handleChange}
                        placeholder="Nomor telepon"
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
                            nik: "",
                            gender: "",
                            number_phone: "",
                        });
                    }}
                >
                    Reset
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Menyimpan..." : "Simpan Pengguna"}
                </Button>
            </div>
        </form>
    );
}
