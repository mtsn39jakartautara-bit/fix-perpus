import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { useState, FormEvent } from "react";
import { useForm } from "@inertiajs/react";

export default function Welcome(props: any) {
    const { data, setData, post, processing, errors } = useForm({
        username: "",
        password: "",
    });

    const [showDemo, setShowDemo] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route("login.attempt"));
    };

    // Demo login untuk development (opsional)
    const handleDemoLogin = () => {
        setData({
            username: "2024001",
            password: "password123",
        });
        setShowDemo(true);
        setTimeout(() => {
            post(route("login.attempt"));
        }, 100);
    };
    return (
        <>
            <Head title="E-Perpustakaan MTSN 39 Jakarta Utara" />

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
                                    <GraduationCap
                                        className="h-32 w-32 text-white"
                                        strokeWidth={1.5}
                                    />
                                    <div className="absolute -right-6 -top-6 grid h-20 w-20 place-items-center rounded-3xl bg-white/90 text-primary shadow-card">
                                        <BookOpen className="h-9 w-9" />
                                    </div>
                                    <div className="absolute -bottom-4 -left-6 grid h-16 w-16 place-items-center rounded-2xl bg-mint text-primary shadow-card">
                                        <Sparkles className="h-7 w-7" />
                                    </div>
                                </div>
                            </div>
                            <h2 className="mt-10 text-3xl font-bold tracking-tight">
                                Belajar jadi seru!
                            </h2>
                            <p className="mt-2 max-w-sm text-white/80">
                                Kelola tugas, absensi, dan poin prestasimu di
                                satu tempat yang menyenangkan.
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
                                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold tracking-tight">
                                        MTsN 39 Jakarta
                                    </h1>
                                    <p className="text-xs text-muted-foreground">
                                        Selamat datang kembali
                                    </p>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold tracking-tight">
                                Masuk ke akunmu
                            </h2>
                            <p className="mt-1.5 text-sm text-muted-foreground">
                                Gunakan akun NIS atau email sekolahmu.
                            </p>

                            {/* Error message */}
                            {errors.username && (
                                <div className="mt-4 rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">
                                    {errors.username}
                                </div>
                            )}

                            <form
                                className="mt-8 space-y-4"
                                onSubmit={handleSubmit}
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        NIS / Email
                                    </label>
                                    <Input
                                        placeholder="2024001 atau nama@smp.id"
                                        className="h-14 rounded-2xl border-0 bg-muted px-5 text-base focus-visible:ring-2 focus-visible:ring-primary"
                                        value={data.username}
                                        onChange={(e) =>
                                            setData("username", e.target.value)
                                        }
                                        disabled={processing}
                                    />
                                    {errors.username && (
                                        <p className="text-xs text-destructive">
                                            {errors.username}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Kata sandi
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-14 rounded-2xl border-0 bg-muted px-5 text-base focus-visible:ring-2 focus-visible:ring-primary"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        disabled={processing}
                                    />
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

                                {/* Demo login button (opsional - untuk development) */}
                                {/* <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    className="h-14 w-full rounded-2xl border-primary/20 text-base font-semibold hover:bg-primary-soft"
                                    onClick={handleDemoLogin}
                                    disabled={processing}
                                >
                                    Demo Login (NIS: 2024001)
                                </Button> */}

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
