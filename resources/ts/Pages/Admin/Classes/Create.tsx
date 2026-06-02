import { useState } from "react";
import { motion } from "framer-motion";
import { Link, router } from "@inertiajs/react";
import { GraduationCap, ArrowLeft, Save, X } from "lucide-react";
import { AdminLayout } from "@/Layouts/AppShellAdmin";

const fade = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
};

export default function ClassesCreate() {
    const [formData, setFormData] = useState({
        name: "",
        level: "",
    });
    const [errors, setErrors] = useState<{ name?: string; level?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(route("admin.classes.store"), formData, {
            onError: (errors) => {
                setErrors(errors);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
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

    const getLevelPreview = () => {
        if (!formData.level) return null;
        const levelNum = parseInt(formData.level);
        const labels: { [key: number]: string } = {
            1: "Kelas 1 (SD)",
            2: "Kelas 2 (SD)",
            3: "Kelas 3 (SD)",
            4: "Kelas 4 (SD)",
            5: "Kelas 5 (SD)",
            6: "Kelas 6 (SD)",
            7: "Kelas 7 (SMP)",
            8: "Kelas 8 (SMP)",
            9: "Kelas 9 (SMP)",
            10: "Kelas 10 (SMA)",
            11: "Kelas 11 (SMA)",
            12: "Kelas 12 (SMA)",
        };
        return labels[levelNum] || `Kelas ${levelNum}`;
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
                            href={route("admin.classes.index")}
                            className="rounded-xl bg-card p-2 shadow-soft transition-all hover:bg-muted"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                                    Tambah Kelas Baru
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Buat data kelas baru untuk sekolah
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
                                {/* Level Field */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Tingkat Kelas{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleChange}
                                        className={`w-full rounded-xl border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                                            errors.level ? "border-red-500" : ""
                                        }`}
                                        required
                                    >
                                        <option value="">
                                            Pilih Tingkat Kelas
                                        </option>
                                        <option value="1">Kelas 1 (SD)</option>
                                        <option value="2">Kelas 2 (SD)</option>
                                        <option value="3">Kelas 3 (SD)</option>
                                        <option value="4">Kelas 4 (SD)</option>
                                        <option value="5">Kelas 5 (SD)</option>
                                        <option value="6">Kelas 6 (SD)</option>
                                        <option value="7">Kelas 7 (SMP)</option>
                                        <option value="8">Kelas 8 (SMP)</option>
                                        <option value="9">Kelas 9 (SMP)</option>
                                        <option value="10">
                                            Kelas 10 (SMA)
                                        </option>
                                        <option value="11">
                                            Kelas 11 (SMA)
                                        </option>
                                        <option value="12">
                                            Kelas 12 (SMA)
                                        </option>
                                    </select>
                                    {errors.level && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.level}
                                        </p>
                                    )}
                                </div>

                                {/* Name Field */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Nama Kelas{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Contoh: 7A, 8B, 9C"
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
                                        Nama kelas harus unik, contoh: 7A, 8B,
                                        9C, dll.
                                    </p>
                                </div>

                                {/* Preview */}
                                {formData.name && formData.level && (
                                    <div className="rounded-xl bg-primary/10 p-4">
                                        <p className="text-xs font-medium text-primary mb-2">
                                            Preview:
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                                <GraduationCap className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {formData.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {getLevelPreview()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Link
                                href={route("admin.classes.index")}
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
                                {isSubmitting ? "Menyimpan..." : "Simpan Kelas"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AdminLayout>
    );
}
