import { useState } from "react";
import { motion } from "framer-motion";
import { Link, router } from "@inertiajs/react";
import { Tag, ArrowLeft, Save, X } from "lucide-react";
import { AdminLayout } from "@/Layouts/AppShellAdmin";
import { Category } from "@/types/category";

interface Props {
    category: Category;
}

const fade = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
};

export default function CategoriesEdit({ category }: Props) {
    const [formData, setFormData] = useState({
        name: category.name,
    });
    const [errors, setErrors] = useState<{ name?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.put(route("admin.categories.update", category.id), formData, {
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
                            href={route("admin.categories.index")}
                            className="rounded-xl bg-card p-2 shadow-soft transition-all hover:bg-muted"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                <Tag className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                                    Edit Kategori
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Update informasi kategori buku
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
                                        Nama Kategori{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Contoh: Fiksi, Non-Fiksi, Pendidikan, Teknologi"
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
                                        Nama kategori akan otomatis dibuatkan
                                        slug untuk URL yang friendly.
                                    </p>
                                </div>

                                {/* Current Info */}
                                <div className="rounded-xl bg-muted/50 p-4">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Slug saat ini:
                                            </span>
                                            <span className="font-mono text-xs">
                                                {category.slug}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Total Buku:
                                            </span>
                                            <span className="font-medium">
                                                {category.books_count || 0} buku
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Dibuat pada:
                                            </span>
                                            <span>
                                                {new Date(
                                                    category.created_at
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
                                {formData.name &&
                                    formData.name !== category.name && (
                                        <div className="rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 p-4">
                                            <p className="text-xs font-medium text-purple-600 mb-2">
                                                Preview Update:
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                                    <Tag className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">
                                                        {formData.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        slug:{" "}
                                                        {formData.name
                                                            .toLowerCase()
                                                            .replace(/ /g, "-")
                                                            .replace(
                                                                /[^\w-]+/g,
                                                                ""
                                                            )}
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
                                href={route("admin.categories.index")}
                                className="inline-flex items-center gap-2 rounded-xl border-border bg-background px-6 py-2.5 text-sm font-medium transition-all hover:bg-muted"
                            >
                                <X className="h-4 w-4" />
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="h-4 w-4" />
                                {isSubmitting
                                    ? "Menyimpan..."
                                    : "Update Kategori"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AdminLayout>
    );
}
