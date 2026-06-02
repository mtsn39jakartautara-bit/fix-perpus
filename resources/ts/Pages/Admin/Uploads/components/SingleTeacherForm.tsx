// resources/js/Pages/Admin/Uploads/components/SingleTeacherForm.tsx

import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/Components/ui/alert";

export default function SingleTeacherForm() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        nip: "",
        subject: "",
        phone: "",
        address: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Auto-generate email when NIP changes
    useEffect(() => {
        if (formData.nip && formData.nip.trim() !== "") {
            const generatedEmail = `teacher.${formData.nip}@mtsn39.com`;
            setFormData((prev) => ({ ...prev, email: generatedEmail }));
        } else {
            setFormData((prev) => ({ ...prev, email: "" }));
        }
    }, [formData.nip]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        router.post(route("admin.teachers.single"), formData, {
            onSuccess: () => {
                setFormData({
                    name: "",
                    email: "",
                    nip: "",
                    subject: "",
                    phone: "",
                    address: "",
                });
                toast.success("Data guru berhasil disimpan");
                setLoading(false);
            },
            onError: (err) => {
                setErrors(err);
                setLoading(false);
                toast.error("Data guru gagal disimpan");
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Info Alert */}
            <Alert className="bg-sky border-primary/20">
                <AlertDescription className="text-sm">
                    💡 Email akan dibuat OTOMATIS dari NIP:{" "}
                    <strong>teacher.[NIP]@mtsn39.com</strong>
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

                {/* NIP */}
                <div className="space-y-2">
                    <Label htmlFor="nip">
                        NIP <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="nip"
                        name="nip"
                        value={formData.nip}
                        onChange={handleChange}
                        placeholder="Nomor Induk Pegawai"
                        className={errors.nip ? "border-red-500" : ""}
                    />
                    <p className="text-xs text-gray-500">
                        Password akan menggunakan NIP ini
                    </p>
                    {errors.nip && (
                        <p className="text-sm text-red-500">{errors.nip}</p>
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
                        Email otomatis dibuat dari NIP
                    </p>
                    {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                </div>

                {/* Subject */}
                <div className="space-y-2">
                    <Label htmlFor="subject">
                        Mata Pelajaran <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Mata pelajaran yang diajar"
                        className={errors.subject ? "border-red-500" : ""}
                    />
                    {errors.subject && (
                        <p className="text-sm text-red-500">{errors.subject}</p>
                    )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                    <Label htmlFor="phone">No. HP</Label>
                    <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Nomor telepon"
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
                        placeholder="Alamat lengkap guru"
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
                            nip: "",
                            subject: "",
                            phone: "",
                            address: "",
                        });
                    }}
                >
                    Reset
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Menyimpan..." : "Simpan Guru"}
                </Button>
            </div>
        </form>
    );
}
