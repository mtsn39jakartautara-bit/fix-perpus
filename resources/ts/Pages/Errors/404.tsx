import { Head, Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import { FileSearch, ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { useState } from "react";

export default function Error404() {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(
                searchQuery
            )}`;
        }
    };

    return (
        <>
            <Head title="Halaman Tidak Ditemukan - 404" />

            <main>
                <div className="relative min-h-screen overflow-hidden bg-gradient-hero">
                    {/* Decorative blobs */}
                    <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary-glow/40 blur-3xl animate-blob" />
                    <div
                        className="pointer-events-none absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-mint/30 blur-3xl animate-blob"
                        style={{ animationDelay: "3s" }}
                    />

                    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="mx-auto w-full max-w-2xl rounded-[2rem] bg-card p-8 shadow-float lg:p-12"
                        >
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl animate-pulse" />
                                    <div className="relative grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-soft">
                                        <FileSearch
                                            className="h-16 w-16 text-white"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Error Code */}
                            <div className="text-center">
                                <h1 className="text-8xl font-black tracking-tighter text-primary sm:text-9xl">
                                    404
                                </h1>
                                <div className="mt-4 space-y-2">
                                    <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                        Halaman Tidak Ditemukan
                                    </h2>
                                    <p className="text-muted-foreground">
                                        Maaf, halaman yang Anda cari tidak dapat
                                        ditemukan atau telah dipindahkan.
                                    </p>
                                </div>
                            </div>

                            {/* Search Form */}
                            <form onSubmit={handleSearch} className="mt-8">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Cari buku, pengumuman, atau halaman..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="h-14 w-full rounded-2xl border-0 bg-muted pl-12 pr-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    />
                                </div>
                            </form>

                            {/* Action Buttons */}
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                                <Link href={route("dashboard.index")}>
                                    <Button
                                        variant="default"
                                        size="lg"
                                        className="w-full gap-2 rounded-2xl bg-gradient-primary text-base font-semibold shadow-soft transition-all hover:shadow-float hover:brightness-110 sm:w-auto"
                                    >
                                        <Home className="h-5 w-5" />
                                        Kembali ke Beranda
                                    </Button>
                                </Link>

                                <button
                                    onClick={() => window.history.back()}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/20 px-6 py-3 text-base font-semibold transition-all hover:bg-primary-soft"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                    Halaman Sebelumnya
                                </button>
                            </div>

                            {/* Suggestions */}
                            <div className="mt-8 rounded-2xl bg-muted/50 p-6">
                                <h3 className="mb-3 font-semibold text-foreground">
                                    Mungkin Anda mencari:
                                </h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>• Koleksi buku digital dan fisik</li>
                                    <li>• Informasi peminjaman buku</li>
                                    <li>• Pengumuman perpustakaan terbaru</li>
                                    <li>• Panduan penggunaan perpustakaan</li>
                                </ul>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </>
    );
}
