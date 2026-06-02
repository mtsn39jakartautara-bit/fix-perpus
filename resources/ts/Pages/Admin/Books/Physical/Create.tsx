import { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/Layouts/AppShell";
import { Link, router } from "@inertiajs/react";
import {
    ArrowLeft,
    BookOpen,
    Save,
    Upload,
    Calendar,
    User,
    Building,
    MapPin,
    Barcode,
    AlignLeft,
    Package,
    Image as ImageIcon,
} from "lucide-react";
import { AdminLayout } from "@/Layouts/AppShellAdmin";

const fade = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
};

export default function PhysicalBookCreate() {
    const [formData, setFormData] = useState({
        title: "",
        isbn: "",
        author: "",
        publisher: "",
        location_rack: "",
        publish_year: "",
        abstract: "",
        stock: "1",
        cover_image: null as File | null,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                setErrors((prev) => ({
                    ...prev,
                    cover_image: "File harus berupa gambar",
                }));
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                setErrors((prev) => ({
                    ...prev,
                    cover_image: "Ukuran file maksimal 2MB",
                }));
                return;
            }
            setFormData((prev) => ({ ...prev, cover_image: file }));
            setCoverPreview(URL.createObjectURL(file));
            if (errors.cover_image) {
                setErrors((prev) => ({ ...prev, cover_image: "" }));
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append("title", formData.title);
        if (formData.isbn) data.append("isbn", formData.isbn);
        if (formData.author) data.append("author", formData.author);
        if (formData.publisher) data.append("publisher", formData.publisher);
        if (formData.location_rack)
            data.append("location_rack", formData.location_rack);
        if (formData.publish_year)
            data.append("publish_year", formData.publish_year);
        if (formData.abstract) data.append("abstract", formData.abstract);
        data.append("stock", formData.stock);
        if (formData.cover_image)
            data.append("cover_image", formData.cover_image);

        router.post(route("admin.books.physical.store"), data, {
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
                        href={route("admin.books.physical.index")}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Daftar Buku
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                                Tambah Buku Fisik
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Isi form di bawah untuk menambahkan buku fisik
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
                                        ISBN
                                    </label>
                                    <div className="relative">
                                        <Barcode className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="text"
                                            name="isbn"
                                            value={formData.isbn}
                                            onChange={handleChange}
                                            placeholder="ISBN (opsional)"
                                            className="h-12 w-full rounded-xl border-border bg-background pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium"></label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="text"
                                            name="author"
                                            value={formData.author}
                                            onChange={handleChange}
                                            placeholder="Penulis"
                                            className="h-12 w-full rounded-xl border-border bg-background pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
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
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Lokasi Rak
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        name="location_rack"
                                        value={formData.location_rack}
                                        onChange={handleChange}
                                        placeholder="Contoh: Rak A1, Rak 3B"
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

                    {/* Stock & Cover */}
                    <div className="rounded-3xl bg-card p-6 shadow-soft">
                        <h2 className="mb-4 text-lg font-semibold">
                            Stok & Cover
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Jumlah Stok Awal{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Package className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                        className="h-12 w-full rounded-xl border-border bg-background pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                        required
                                    />
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Jumlah eksemplar awal buku ini
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Cover Buku
                                </label>
                                <div
                                    className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all ${
                                        coverPreview
                                            ? "border-primary bg-primary/5"
                                            : "border-border bg-background hover:border-primary/50"
                                    }`}
                                    onClick={() =>
                                        document
                                            .getElementById("cover-upload")
                                            ?.click()
                                    }
                                >
                                    <input
                                        id="cover-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    {coverPreview ? (
                                        <>
                                            <img
                                                src={coverPreview}
                                                alt="Cover Preview"
                                                className="h-32 w-auto rounded-lg object-cover"
                                            />
                                            <p className="mt-2 text-sm font-medium text-primary">
                                                {formData.cover_image?.name}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        cover_image: null,
                                                    }));
                                                    setCoverPreview(null);
                                                }}
                                                className="mt-2 text-xs text-red-500 hover:text-red-600"
                                            >
                                                Hapus cover
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                            <p className="mt-2 text-sm font-medium">
                                                Klik untuk upload cover
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Format: JPG, PNG, GIF (Maks.
                                                2MB)
                                            </p>
                                        </>
                                    )}
                                </div>
                                {errors.cover_image && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.cover_image}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pb-8">
                        <Link
                            href={route("admin.books.physical.index")}
                            className="flex-1 rounded-xl border-border bg-background px-4 py-3 text-center font-medium transition-all hover:bg-muted"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 font-medium text-white shadow-soft transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
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
