import { useState } from "react";
import { motion } from "framer-motion";
import { Link, router } from "@inertiajs/react";
import { Calendar, ArrowLeft, Save, X, Star } from "lucide-react";
import { AdminLayout } from "@/Layouts/AppShellAdmin";

const fade = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
};

export default function AcademicYearsCreate() {
    const [formData, setFormData] = useState({
        name: "",
        is_active: false,
    });
    const [errors, setErrors] = useState<{ name?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(route("admin.academic-years.store"), formData, {
            onError: (errors) => {
                setErrors(errors);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Clear error for this field
        if (errors[e.target.name as keyof typeof errors]) {
            setErrors({
                ...errors,
                [e.target.name]: undefined,
            });
        }
    };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-4xl px-5 pt-8 lg:px-10 lg:pt-10">
                {/* Header */}
                <motion.div
                    {...fade}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4">
                        <Link
                            href={route("admin.academic-years.index")}
                            className="rounded-xl bg-card p-2 shadow-soft transition-all hover:bg-muted"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                                    Tambah Tahun Ajaran Baru
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Buat periode tahun ajaran baru untuk sekolah
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div
                    {...fade}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="rounded-3xl bg-card p-6 shadow-soft">
                            <div className="space-y-5">
                                {/* Name Field */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Nama Tahun Ajaran{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Contoh: 2024/2025, 2025/2026"
                                        className={`w-full rounded-xl border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                                            errors.name ? "border-red-500" : ""
                                        }`}
                                        autoFocus
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.name}
                                        </p>
                                    )}
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Format: Tahun Mulai/Tahun Selesai
                                        (contoh: 2024/2025)
                                    </p>
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                is_active: e.target.checked,
                                            })
                                        }
                                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                    />
                                    <label
                                        htmlFor="is_active"
                                        className="text-sm font-medium"
                                    >
                                        Set sebagai tahun ajaran aktif
                                    </label>
                                </div>

                                {/* Preview */}
                                {formData.name && (
                                    <div className="rounded-xl bg-primary/10 p-4">
                                        <p className="text-xs font-medium text-primary mb-2">
                                            Preview:
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                                <Calendar className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {formData.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formData.is_active ? (
                                                        <span className="inline-flex items-center gap-1 text-green-600">
                                                            <Star className="h-3 w-3" />
                                                            Akan diaktifkan
                                                        </span>
                                                    ) : (
                                                        "Status: Tidak Aktif"
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="rounded-2xl bg-blue-50 p-4 border border-blue-200">
                            <p className="text-sm text-blue-800">
                                <strong>ℹ️ Informasi:</strong> Hanya satu tahun
                                ajaran yang dapat diaktifkan dalam satu waktu.
                                Jika Anda memilih "Set sebagai tahun ajaran
                                aktif", tahun ajaran yang sedang aktif akan
                                otomatis dinonaktifkan.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Link
                                href={route("admin.academic-years.index")}
                                className="inline-flex items-center gap-2 rounded-xl border-border bg-background px-6 py-2.5 text-sm font-medium transition-all hover:bg-muted"
                            >
                                <X className="h-4 w-4" />
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="h-4 w-4" />
                                {isSubmitting
                                    ? "Menyimpan..."
                                    : "Simpan Tahun Ajaran"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AdminLayout>
    );
}
