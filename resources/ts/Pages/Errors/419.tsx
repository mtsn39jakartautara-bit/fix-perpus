import { Head, Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Clock, ArrowLeft, Home, RefreshCw } from "lucide-react";
import { Button } from "@/Components/ui/button";

export default function Error419() {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <>
            <Head title="Halaman Kadaluarsa - 419" />

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
                                    <div className="absolute inset-0 rounded-full bg-yellow-500/20 blur-2xl animate-pulse" />
                                    <div className="relative grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 shadow-soft">
                                        <Clock
                                            className="h-16 w-16 text-white"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Error Code */}
                            <div className="text-center">
                                <h1 className="text-8xl font-black tracking-tighter text-primary sm:text-9xl">
                                    419
                                </h1>
                                <div className="mt-4 space-y-2">
                                    <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                        Halaman Kadaluarsa
                                    </h2>
                                    <p className="text-muted-foreground">
                                        Sesi Anda telah berakhir atau halaman
                                        ini sudah tidak valid. Silakan refresh
                                        halaman atau kembali ke beranda.
                                    </p>
                                </div>
                            </div>

                            {/* Possible Causes */}
                            <div className="mt-8 rounded-2xl bg-muted/50 p-6">
                                <h3 className="mb-3 font-semibold text-foreground">
                                    Kemungkinan penyebab:
                                </h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-yellow-500" />
                                        <span>
                                            Halaman terlalu lama tidak
                                            di-refresh
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-yellow-500" />
                                        <span>
                                            Token CSRF tidak valid atau
                                            kadaluarsa
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-yellow-500" />
                                        <span>
                                            Mengirim form yang sudah diproses
                                            sebelumnya
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-yellow-500" />
                                        <span>
                                            Koneksi internet terputus saat
                                            proses submit
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                                <Button
                                    onClick={handleRefresh}
                                    variant="default"
                                    size="lg"
                                    className="group gap-2 rounded-2xl bg-gradient-primary text-base font-semibold shadow-soft transition-all hover:shadow-float hover:brightness-110"
                                >
                                    <RefreshCw className="h-5 w-5 transition-transform group-hover:rotate-180" />
                                    Refresh Halaman
                                </Button>

                                <Link href={route("dashboard.index")}>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="w-full gap-2 rounded-2xl border-primary/20 text-base font-semibold transition-all hover:bg-primary-soft sm:w-auto"
                                    >
                                        <Home className="h-5 w-5" />
                                        Kembali ke Beranda
                                    </Button>
                                </Link>

                                <Link href={route("login")}>
                                    <Button
                                        variant="ghost"
                                        size="lg"
                                        className="gap-2 rounded-2xl text-base font-semibold"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                        Halaman Login
                                    </Button>
                                </Link>
                            </div>

                            {/* Help Text */}
                            <p className="mt-6 text-center text-xs text-muted-foreground">
                                Jika masalah berlanjut, silakan{" "}
                                <a
                                    href="#"
                                    className="font-semibold text-primary hover:underline"
                                >
                                    hubungi admin perpustakaan
                                </a>
                            </p>
                        </motion.div>
                    </div>
                </div>
            </main>
        </>
    );
}
