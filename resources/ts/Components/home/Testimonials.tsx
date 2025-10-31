import { useState, useEffect } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/Components/ui/button";

const Testimonials = () => {
    const testimonials = [
        {
            name: "Dr. Ahmad Fauzi, M.Si",
            role: "Alumni HMI - Direktur Perusahaan",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
            quote: "HMI membentuk karakter saya menjadi pemimpin yang berintegritas. Pengalaman organisasi di HMI sangat berharga untuk karir profesional saya.",
        },
        {
            name: "Siti Nurhaliza, S.Pd",
            role: "Alumni HMI - Kepala Sekolah",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
            quote: "Kaderisasi di HMI mengajarkan saya pentingnya ilmu, iman, dan amal. Nilai-nilai ini menjadi pegangan saya dalam mendidik generasi muda.",
        },
        {
            name: "M. Rizki Ramadhan, S.H",
            role: "Alumni HMI - Advokat",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
            quote: "Di HMI saya belajar berpikir kritis dan memperjuangkan keadilan. Organisasi ini membentuk jiwa aktivis yang selalu peduli pada masyarakat.",
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const next = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prev = () => {
        setCurrentIndex(
            (prev) => (prev - 1 + testimonials.length) % testimonials.length
        );
    };

    return (
        <section className="py-20 bg-gradient-to-br from-green-900 to-green-950">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="font-serif font-bold text-4xl md:text-5xl text-white mb-4">
                        Kata Alumni
                    </h2>
                    <p className="text-primary-foreground/90 text-lg">
                        Kisah sukses alumni HMI Cabang Depok
                    </p>
                </div>

                <div className="max-w-4xl mx-auto relative">
                    <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-xl border border-border">
                        <Quote className="text-green-900  mb-6" size={48} />

                        <div className="mb-8">
                            <p className="text-xl md:text-2xl text-foreground italic leading-relaxed">
                                "{testimonials[currentIndex]?.quote}"
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <img
                                src={testimonials[currentIndex]?.image}
                                alt={testimonials[currentIndex]?.name}
                                className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                            />
                            <div>
                                <div className="font-semibold text-lg text-foreground">
                                    {testimonials[currentIndex]?.name}
                                </div>
                                <div className="text-green-900 font-semibold">
                                    {testimonials[currentIndex]?.role}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={prev}
                            className="rounded-full"
                        >
                            <ChevronLeft size={20} />
                        </Button>

                        <div className="flex gap-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                                        index === currentIndex
                                            ? "bg-primary w-8"
                                            : "bg-border hover:bg-border/60"
                                    }`}
                                />
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={next}
                            className="rounded-full"
                        >
                            <ChevronRight size={20} />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
