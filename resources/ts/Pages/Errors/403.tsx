import { Head, Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft, Home, Lock } from "lucide-react";
import { Button } from "@/Components/ui/button";

interface Error403Props {
    message?: string;
}

export default function Error403({ message }: Error403Props) {
    return (
        <>
            <Head title="Akses Ditolak - 403" />

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
                                    <div className="absolute inset-0 rounded-full bg-red-500/20 blur-2xl animate-pulse" />
                                    <div className="relative grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-soft">
                                        <ShieldAlert
                                            className="h-16 w-16 text-white"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Error Code */}
                            <div className="text-center">
                                <h1 className="text-8xl font-black tracking-tighter text-primary sm:text-9xl">
                                    403
                                </h1>
                                <div className="mt-4 space-y-2">
                                    <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                        Akses Ditolak
                                    </h2>
                                    <p className="text-muted-foreground">
                                        {message ||
                                            "Maaf, Anda tidak memiliki izin untuk mengakses halaman ini."}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
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

                                <Link href={route("login")}>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="gap-2 rounded-2xl border-primary/20 text-base font-semibold transition-all hover:bg-primary-soft"
                                    >
                                        <Lock className="h-5 w-5" />
                                        Halaman Login
                                    </Button>
                                </Link>
                            </div>

                            {/* Help Text */}
                            <p className="mt-6 text-center text-xs text-muted-foreground">
                                Butuh bantuan?{" "}
                                <a
                                    href="#"
                                    className="font-semibold text-primary hover:underline"
                                >
                                    Hubungi admin perpustakaan
                                </a>
                            </p>
                        </motion.div>
                    </div>
                </div>
            </main>
        </>
    );
}
