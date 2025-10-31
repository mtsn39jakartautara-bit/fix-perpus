import {
    Mail,
    Phone,
    MapPin,
    Instagram,
    Facebook,
    Twitter,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";

const Footer = () => {
    return (
        <footer className="bg-foreground text-background">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* About */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-primary-foreground font-bold">
                                    HMI
                                </span>
                            </div>
                            <div className="font-serif font-bold text-lg">
                                HMI Cabang Depok
                            </div>
                        </div>
                        <p className="text-sm text-background/80 mb-4">
                            Organisasi mahasiswa Islam yang bergerak dalam
                            bidang kaderisasi, pengembangan intelektual, dan
                            pemberdayaan masyarakat.
                        </p>
                        <div className="flex gap-3">
                            <a
                                href="https://instagram.com/hmicabangdepok"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 bg-background/10 hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                            >
                                <Instagram size={18} />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 bg-background/10 hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                            >
                                <Facebook size={18} />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 bg-background/10 hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                            >
                                <Twitter size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick as */}
                    <div>
                        <h3 className="font-serif font-semibold text-lg mb-4">
                            Tautan Cepat
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="/"
                                    className="text-sm text-background/80 hover:text-primary transition-colors"
                                >
                                    Beranda
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/keorganisasian"
                                    className="text-sm text-background/80 hover:text-primary transition-colors"
                                >
                                    Keorganisasian
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/berita"
                                    className="text-sm text-background/80 hover:text-primary transition-colors"
                                >
                                    Berita
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/latihan-kader"
                                    className="text-sm text-background/80 hover:text-primary transition-colors"
                                >
                                    Latihan Kader
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/kontak"
                                    className="text-sm text-background/80 hover:text-primary transition-colors"
                                >
                                    Kontak Kami
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-serif font-semibold text-lg mb-4">
                            Kontak
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-sm text-background/80">
                                <MapPin
                                    size={18}
                                    className="mt-0.5 flex-shrink-0"
                                />
                                <span>
                                    Jl. Margonda Raya, Depok, Jawa Barat 16424
                                </span>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-background/80">
                                <Phone size={18} className="flex-shrink-0" />
                                <a
                                    href="tel:+6281234567890"
                                    className="hover:text-primary transition-colors"
                                >
                                    +62 812-3456-7890
                                </a>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-background/80">
                                <Mail size={18} className="flex-shrink-0" />
                                <a
                                    href="mailto:info@hmicabangdepok.id"
                                    className="hover:text-primary transition-colors"
                                >
                                    info@hmicabangdepok.id
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="font-serif font-semibold text-lg mb-4">
                            Newsletter
                        </h3>
                        <p className="text-sm text-background/80 mb-4">
                            Dapatkan update berita dan kegiatan HMI langsung di
                            email Anda
                        </p>
                        <form className="flex gap-2">
                            <Input
                                type="email"
                                placeholder="Email Anda"
                                className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
                            />
                            <Button type="submit" variant="secondary" size="sm">
                                Kirim
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-background/20 pt-6 mt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/60">
                        <p>
                            &copy; 2024 HMI Cabang Depok. All rights reserved.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="/privacy"
                                className="hover:text-primary transition-colors"
                            >
                                Kebijakan Privasi
                            </a>
                            <a
                                href="/terms"
                                className="hover:text-primary transition-colors"
                            >
                                Syarat & Ketentuan
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
