import { useState } from "react";
import { motion } from "framer-motion";
import { Link, router } from "@inertiajs/react";
import { Megaphone, ArrowLeft, Save, X, Calendar, Tag } from "lucide-react";
import { AdminLayout } from "@/Layouts/AppShellAdmin";
import { Announcement } from "@/types/announcement";

interface Props {
    announcement: Announcement;
}

const fade = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
};

const categoryOptions = [
    { value: "umum", label: "Umum" },
    { value: "akademik", label: "Akademik" },
    { value: "perpustakaan", label: "Perpustakaan" },
    { value: "event", label: "Event" },
    { value: "pengumuman", label: "Pengumuman" },
];

export default function AnnouncementsEdit({ announcement }: Props) {
    const [formData, setFormData] = useState({
        title: announcement.title,
        description: announcement.description,
        category: announcement.category,
        date: announcement.date.split("T")[0],
        is_active: announcement.is_active,
    });
    const [errors, setErrors] = useState<{
        title?: string;
        description?: string;
        category?: string;
        date?: string;
    }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.put(
            route("admin.announcements.update", announcement.id),
            formData,
            {
                onError: (errors) => {
                    setErrors(errors);
                    setIsSubmitting(false);
                },
                onSuccess: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
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
                            href={route("admin.announcements.index")}
                            className="rounded-xl bg-card p-2 shadow-soft transition-all hover:bg-muted"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                                <Megaphone className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                                    Edit Pengumuman
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Update informasi pengumuman
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
                                {/* Title Field */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Judul Pengumuman{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Masukkan judul pengumuman"
                                        className={`w-full rounded-xl border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                                            errors.title ? "border-red-500" : ""
                                        }`}
                                        autoFocus
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                {/* Category and Date Row */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Kategori{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                        >
                                            {categoryOptions.map((opt) => (
                                                <option
                                                    key={opt.value}
                                                    value={opt.value}
                                                >
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.category}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Tanggal{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            className={`w-full rounded-xl border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                                                errors.date
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                        />
                                        {errors.date && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.date}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Description Field */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Deskripsi Pengumuman{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={6}
                                        placeholder="Tulis isi pengumuman di sini..."
                                        className={`w-full rounded-xl border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                                            errors.description
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.description}
                                        </p>
                                    )}
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
                                        Aktif (ditampilkan ke pengguna)
                                    </label>
                                </div>

                                {/* Current Info */}
                                <div className="rounded-xl bg-muted/50 p-4">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Status saat ini:
                                            </span>
                                            <span
                                                className={`font-medium ${
                                                    announcement.is_active
                                                        ? "text-green-600"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                {announcement.is_active
                                                    ? "Aktif"
                                                    : "Tidak Aktif"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Dibuat pada:
                                            </span>
                                            <span>
                                                {new Date(
                                                    announcement.created_at
                                                ).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Terakhir diupdate:
                                            </span>
                                            <span>
                                                {new Date(
                                                    announcement.updated_at
                                                ).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview */}
                                {(formData.title !== announcement.title ||
                                    formData.description !==
                                        announcement.description ||
                                    formData.category !==
                                        announcement.category ||
                                    formData.date !==
                                        announcement.date.split("T")[0]) && (
                                    <div className="rounded-xl bg-primary/10 p-4">
                                        <p className="text-xs font-medium text-primary mb-3">
                                            Preview Update:
                                        </p>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                                    <Megaphone className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">
                                                        {formData.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Tag className="h-3 w-3" />
                                                        <span>
                                                            {
                                                                categoryOptions.find(
                                                                    (c) =>
                                                                        c.value ===
                                                                        formData.category
                                                                )?.label
                                                            }
                                                        </span>
                                                        <Calendar className="h-3 w-3 ml-1" />
                                                        <span>
                                                            {formData.date}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {formData.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {formData.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Link
                                href={route("admin.announcements.index")}
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
                                    : "Update Pengumuman"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AdminLayout>
    );
}
