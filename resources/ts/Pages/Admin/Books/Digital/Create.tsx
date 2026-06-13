import { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/Layouts/AppShell";
import { Link, router } from "@inertiajs/react";
import {
    ArrowLeft,
    BookOpen,
    Save,
    X,
    Upload,
    FileText,
    Calendar,
    User,
    Building,
    Tag,
    AlignLeft,
    Check,
} from "lucide-react";
import { AdminLayout } from "@/Layouts/AppShellAdmin";

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    categories: Category[];
}

const fade = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
};

export default function DigitalBookCreate({ categories }: Props) {
    const [formData, setFormData] = useState({
        title: "",
        author: "",
        publisher: "",
        publish_year: "",
        abstract: "",
        categories: [] as number[],
        pdf_file: null as File | null,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [pdfPreview, setPdfPreview] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleCategoryToggle = (categoryId: number) => {
        setFormData((prev) => ({
            ...prev,
            categories: prev.categories.includes(categoryId)
                ? prev.categories.filter((id) => id !== categoryId)
                : [...prev.categories, categoryId],
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== "application/pdf") {
                setErrors((prev) => ({
                    ...prev,
                    pdf_file: "File harus berupa PDF",
                }));
                return;
            }
            if (file.size > 50 * 1024 * 1024) {
                setErrors((prev) => ({
                    ...prev,
                    pdf_file: "Ukuran file maksimal 10MB",
                }));
                return;
            }
            setFormData((prev) => ({ ...prev, pdf_file: file }));
            setPdfPreview(URL.createObjectURL(file));
            if (errors.pdf_file) {
                setErrors((prev) => ({ ...prev, pdf_file: "" }));
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append("title", formData.title);
        if (formData.author) data.append("author", formData.author);
        if (formData.publisher) data.append("publisher", formData.publisher);
        if (formData.publish_year)
            data.append("publish_year", formData.publish_year);
        if (formData.abstract) data.append("abstract", formData.abstract);
        formData.categories.forEach((id) =>
            data.append("categories[]", id.toString())
        );
        if (formData.pdf_file) data.append("pdf_file", formData.pdf_file);

        router.post(route("admin.books.digital.store"), data, {
            onSuccess: () => {
                setLoading(false);
            },
            onError: (err) => {
                setErrors(err);
                setLoading(false);
            },
        });
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
                    <Link
                        href={route("admin.books.digital.index")}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Daftar Buku
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                                Tambah Buku Digital
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Isi form di bawah untuk menambahkan buku digital
                                baru
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.form
                    {...fade}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Basic Information */}
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <h2 className="mb-4 text-lg font-semibold">
                            Informasi Dasar
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Judul Buku{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <BookOpen className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Masukkan judul buku"
                                        className="h-12 w-full rounded-xl border-border bg-background pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                        required
                                    />
                                </div>
                                {errors.title && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Penulis
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="text"
                                            name="author"
                                            value={formData.author}
                                            onChange={handleChange}
                                            placeholder="Nama penulis"
                                            className="h-12 w-full rounded-xl border-border bg-background pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Penerbit
                                    </label>
                                    <div className="relative">
                                        <Building className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="text"
                                            name="publisher"
                                            value={formData.publisher}
                                            onChange={handleChange}
                                            placeholder="Nama penerbit"
                                            className="h-12 w-full rounded-xl border-border bg-background pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Tahun Terbit
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="number"
                                        name="publish_year"
                                        value={formData.publish_year}
                                        onChange={handleChange}
                                        placeholder="Contoh: 2024"
                                        min="1900"
                                        max={new Date().getFullYear()}
                                        className="h-12 w-full rounded-xl border-border bg-background pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Abstrak / Sinopsis
                                </label>
                                <div className="relative">
                                    <AlignLeft className="absolute left-4 top-4 h-4 w-4 text-muted-foreground" />
                                    <textarea
                                        name="abstract"
                                        value={formData.abstract}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Tuliskan abstrak atau sinopsis buku..."
                                        className="w-full rounded-xl border-border bg-background pl-11 pr-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <h2 className="mb-4 text-lg font-semibold">Kategori</h2>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() =>
                                        handleCategoryToggle(category.id)
                                    }
                                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all ${
                                        formData.categories.includes(
                                            category.id
                                        )
                                            ? "bg-primary text-white shadow-soft"
                                            : "bg-muted text-foreground hover:bg-muted/80"
                                    }`}
                                >
                                    {formData.categories.includes(
                                        category.id
                                    ) && <Check className="h-3 w-3" />}
                                    {category.name}
                                </button>
                            ))}
                        </div>
                        {categories.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-4">
                                Belum ada kategori. Silakan tambahkan kategori
                                terlebih dahulu.
                            </p>
                        )}
                    </div>

                    {/* PDF File Upload */}
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <h2 className="mb-4 text-lg font-semibold">File PDF</h2>
                        <div className="space-y-4">
                            <div
                                className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all ${
                                    formData.pdf_file
                                        ? "border-primary bg-primary/5"
                                        : "border-border bg-background hover:border-primary/50"
                                }`}
                                onClick={() =>
                                    document
                                        .getElementById("pdf-upload")
                                        ?.click()
                                }
                            >
                                <input
                                    id="pdf-upload"
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                {formData.pdf_file ? (
                                    <>
                                        <FileText className="h-12 w-12 text-primary" />
                                        <p className="mt-2 text-sm font-medium text-primary">
                                            {formData.pdf_file.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {(
                                                formData.pdf_file.size /
                                                1024 /
                                                1024
                                            ).toFixed(2)}{" "}
                                            MB
                                        </p>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    pdf_file: null,
                                                }));
                                                setPdfPreview(null);
                                            }}
                                            className="mt-2 text-xs text-red-500 hover:text-red-600"
                                        >
                                            Hapus file
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-12 w-12 text-muted-foreground" />
                                        <p className="mt-2 text-sm font-medium">
                                            Klik untuk upload PDF
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Maksimal ukuran file 10MB
                                        </p>
                                    </>
                                )}
                            </div>
                            {errors.pdf_file && (
                                <p className="text-xs text-red-500">
                                    {errors.pdf_file}
                                </p>
                            )}
                            {pdfPreview && (
                                <iframe
                                    src={pdfPreview}
                                    title="PDF Preview"
                                    className="mt-4 h-96 w-full rounded-xl border-border"
                                />
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pb-8">
                        <Link
                            href={route("admin.books.digital.index")}
                            className="flex-1 rounded-xl border-border bg-background px-4 py-3 text-center font-medium transition-all hover:bg-muted"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-xl bg-gradient-primary px-4 py-3 font-medium text-white shadow-soft transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Menyimpan...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Save className="h-4 w-4" />
                                    Simpan Buku
                                </div>
                            )}
                        </button>
                    </div>
                </motion.form>
            </div>
        </AdminLayout>
    );
}
