import { Button } from "@/Components/ui/button";
import { ArrowRight, Users } from "lucide-react";

const CallToAction = () => {
    return (
        <section className="py-20 bg-gradient-to-br from-hmi-green via-hmi-green-dark to-green-900 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-background/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-background/5 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="w-16 h-16 bg-background/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="text-primary-foreground" size={32} />
                    </div>

                    <h2 className="font-serif font-bold text-4xl md:text-5xl text-primary-foreground mb-6">
                        Bergabunglah Bersama Kami
                    </h2>

                    <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                        Jadilah bagian dari keluarga besar HMI Cabang Depok.
                        Bersama kita membangun generasi mahasiswa yang
                        berintegritas, berintelektual, dan bermanfaat untuk
                        umat.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button
                            size="lg"
                            asChild
                            className="bg-background text-foreground hover:bg-background/90 font-semibold text-lg px-8 py-6 group"
                        >
                            <a
                                href="https://forms.google.com/your-form-url"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Daftar Sekarang
                                <ArrowRight
                                    className="ml-2 group-hover:translate-x-1 transition-transform"
                                    size={20}
                                />
                            </a>
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            asChild
                            className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold text-lg px-8 py-6"
                        >
                            <a href="/latihan-kader">
                                Pelajari Program Kaderisasi
                            </a>
                        </Button>
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary-foreground mb-2">
                                Gratis
                            </div>
                            <div className="text-primary-foreground/80">
                                Biaya Pendaftaran
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary-foreground mb-2">
                                Berkualitas
                            </div>
                            <div className="text-primary-foreground/80">
                                Program Kaderisasi
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary-foreground mb-2">
                                Bersertifikat
                            </div>
                            <div className="text-primary-foreground/80">
                                Pelatihan Resmi
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CallToAction;
