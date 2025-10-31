import { ArrowRight } from "lucide-react";
import React from "react";
import Stats from "./Stats";

export default function Testing() {
    return (
        <section className="relative overflow-hidden py-20 px-6 sm:px-10 lg:px-24">
            {/* Background blobs */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                {/* Soft color blobs */}
                <div className="absolute -left-24 -top-20 w-72 h-72 rounded-full blur-3xl opacity-40 bg-gradient-to-tr from-purple-300 via-pink-300 to-transparent"></div>
                <div className="absolute right-0 top-24 w-56 h-56 rounded-full blur-2xl opacity-30 bg-gradient-to-br from-indigo-200 via-cyan-200 to-transparent"></div>
                <div className="absolute left-1/3 bottom-10 w-96 h-96 rounded-full blur-3xl opacity-20 bg-gradient-to-r from-pink-200 via-yellow-100 to-transparent"></div>

                {/* SVG grid overlay */}
                <svg
                    className="absolute inset-0 w-full h-full"
                    preserveAspectRatio="none"
                    aria-hidden
                >
                    <defs>
                        <pattern
                            id="grid"
                            width="56"
                            height="56"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M56 0H0V56"
                                fill="none"
                                stroke="hsl(var(--hmi-green) / 0.25)" // pakai transparansi 0.25
                                strokeWidth="1"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Decorative small icons / dots */}
                <div className="absolute left-10 top-40 w-3 h-3 rounded-full bg-white/60 blur-sm"></div>
                <div className="absolute right-28 top-36 w-4 h-4 rounded-md bg-white/40 rotate-12 shadow-sm"></div>
                <div className="absolute right-40 bottom-28 w-2 h-2 rounded-full bg-white/50"></div>
            </div>

            <div className="relative max-w-4xl mx-auto text-center">
                <div className="inline-block mb-4 px-4 py-2 bg-primary backdrop-blur-sm border border-primary/30 rounded-full">
                    <span className="text-background font-medium text-sm">
                        Bersama Membangun Generasi Berintegritas
                    </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                    Himpunan Mahasiswa Islam{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-hmi-green-dark to-hmi-green">
                        Cabang Depok
                    </span>
                </h2>

                <p className="mt-6 text-base sm:text-lg text-slate-700 max-w-3xl mx-auto">
                    Organisasi adalah sekumpulan orang yang berinteraksi dan
                    bekerja sama secara terstruktur untuk mencapai tujuan
                    bersama. Dalam organisasi terdapat pembagian tugas, aturan,
                    dan sumber daya yang dikelola agar tujuan dapat tercapai
                    secara efektif dan efisien.
                </p>

                <div className="mt-8 flex justify-center gap-4">
                    <a
                        href="#"
                        className="inline-flex items-center rounded-full bg-hmi-green px-6 py-3 text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
                        aria-label="Pelajari lebih lanjut tentang organisasi"
                    >
                        Bergabung Sekarang
                        <ArrowRight
                            className="ml-2 group-hover:translate-x-1 transition-transform"
                            size={20}
                        />
                    </a>

                    <a
                        href="#"
                        className="inline-flex items-center rounded-full border border-slate-200 px-5 py-3 text-slate-700 bg-white hover:bg-slate-50 transition"
                    >
                        Tentang HMI Cabang Depok
                    </a>
                </div>
            </div>
            <div>
                <Stats />
            </div>
        </section>
    );
}
