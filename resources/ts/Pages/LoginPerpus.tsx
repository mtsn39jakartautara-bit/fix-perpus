import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { FormEvent, useState } from "react";
import { useForm } from "@inertiajs/react";

export default function Welcome(props: any) {
    const { data, setData, post, processing, errors } = useForm({
        identifier: "", // Changed from "username" to "identifier"
        password: "",
    });

    // State untuk show/hide password
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route("login")); // Changed from "login.attempt" to "login" (standard Laravel route)
    };

    // Fungsi toggle show/hide password
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <>
            <Head title="Login" />

            <main>
                <div className="relative h-screen overflow-hidden bg-gradient-hero">
                    {/* Decorative blobs */}
                    <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary-glow/40 blur-3xl animate-blob" />
                    <div
                        className="pointer-events-none absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-mint/30 blur-3xl animate-blob"
                        style={{ animationDelay: "3s" }}
                    />

                    <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 py-12 lg:grid-cols-2 lg:px-12">
                        {/* Hero illustration */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="hidden flex-col items-center text-center text-primary-foreground lg:flex"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 rounded-[3rem] bg-white/10 blur-2xl" />

                                <div className="relative grid h-72 w-72 place-items-center rounded-[3rem] bg-white/15 backdrop-blur-xl shadow-float animate-float">
                                    {/* LOGO UTAMA */}
                                    <img
                                        src="/assets/images/logo.webp"
                                        alt="Logo Perpustakaan"
                                        className="h-32 w-32 object-contain drop-shadow-lg"
                                    />

                                    {/* Floating icon 1 */}
                                    <div className="absolute -right-6 -top-6 grid h-20 w-20 place-items-center rounded-3xl bg-white/90 text-primary shadow-card">
                                        <BookOpen className="h-9 w-9" />
                                    </div>

                                    {/* Floating icon 2 */}
                                    <div className="absolute -bottom-4 -left-6 grid h-16 w-16 place-items-center rounded-2xl bg-mint text-primary shadow-card">
                                        <Sparkles className="h-7 w-7" />
                                    </div>
                                </div>
                            </div>

                            <h2 className="mt-10 text-3xl font-bold tracking-tight">
                                Perpustakaan Digital MTsN 39 Jakarta
                            </h2>

                            <p className="mt-2 max-w-sm text-white/80">
                                Kelola buku, peminjaman, dan aktivitas
                                perpustakaan dalam satu sistem modern dan mudah
                                digunakan.
                            </p>
                        </motion.div>
                        {/* Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="mx-auto w-full max-w-md rounded-[2rem] bg-card p-8 shadow-float lg:p-10"
                        >
                            <div className="mb-8 flex items-center gap-3">
                                <div>
                                    <img
                                        src="/assets/images/logo.webp"
                                        alt="Logo Perpustakaan"
                                        className="h-10 w-h-10 object-contain"
                                    />
                                </div>

                                <div>
                                    <h1 className="text-xl font-bold tracking-tight">
                                        Perpustakaan MTsN 39 Jakarta
                                    </h1>
                                    <p className="text-xs text-muted-foreground">
                                        Asy-Syifa Binti Abdillah
                                    </p>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold tracking-tight">
                                Masuk ke akunmu
                            </h2>
                            <p className="mt-1.5 text-sm text-muted-foreground">
                                Gunakan Email / NISN / NIP / NIK
                            </p>

                            {/* Error message */}
                            {errors.identifier && (
                                <div className="mt-4 rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">
                                    {errors.identifier}
                                </div>
                            )}

                            <form
                                className="mt-8 space-y-4"
                                onSubmit={handleSubmit}
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Email / NISN / NIP / NIK
                                    </label>
                                    <Input
                                        placeholder="Contoh: 2024001, guru123, atau email@sekolah.sch.id"
                                        className="h-14 rounded-2xl border-0 bg-muted px-5 text-base focus-visible:ring-2 focus-visible:ring-primary"
                                        value={data.identifier}
                                        onChange={(e) =>
                                            setData(
                                                "identifier",
                                                e.target.value
                                            )
                                        }
                                        disabled={processing}
                                    />
                                    {errors.identifier && (
                                        <p className="text-xs text-destructive">
                                            {errors.identifier}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Kata sandi
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="••••••••"
                                            className="h-14 rounded-2xl border-0 bg-muted px-5 text-base focus-visible:ring-2 focus-visible:ring-primary pr-12"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value
                                                )
                                            }
                                            disabled={processing}
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                            disabled={processing}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-xs text-destructive">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="group h-14 w-full rounded-2xl bg-gradient-primary text-base font-semibold shadow-soft transition-all hover:shadow-float hover:brightness-110"
                                    disabled={processing}
                                >
                                    {processing ? "Memproses..." : "Masuk"}
                                    {!processing && (
                                        <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    )}
                                </Button>

                                <p className="pt-2 text-center text-sm text-muted-foreground">
                                    Lupa kata sandi?{" "}
                                    <a
                                        className="font-semibold text-primary hover:underline"
                                        href="#"
                                    >
                                        Hubungi admin
                                    </a>
                                </p>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </main>
        </>
    );
}
