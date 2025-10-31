import { Toaster } from "../ui/toaster";
import { TooltipProvider } from "@/Components/ui/tooltip";
import { Toaster as Sonner } from "@/Components/ui/sonner";
import Footer from "./Footer";
import Navbar from "./Navbar";

const AppShell = ({ children }: { children: React.ReactNode }) => {
    const navItems = [
        { name: "Beranda", path: "/" },
        { name: "Sejarah", path: "/sejarah" },
        {
            name: "Keorganisasian",
            path: "/keorganisasian",
            submenu: [
                { name: "HMI Cabang Depok", path: "/keorganisasian" },
                {
                    name: "Koordinator Komisariat",
                    path: "#",
                    submenu: [
                        {
                            name: "Korkom UI",
                            path: "/keorganisasian/korkom/ui",
                        },
                        {
                            name: "Korkom APP",
                            path: "/keorganisasian/korkom/app",
                        },
                    ],
                },
                {
                    name: "Komisariat",
                    path: "#",
                    submenu: [
                        {
                            name: "Fakultas Hukum UI",
                            path: "/keorganisasian/komisariat/fakultas-hukum-ui",
                        },
                        {
                            name: "Fakultas Ilmu Komputer UI",
                            path: "/keorganisasian/komisariat/fakultas-ilmu-komputer",
                        },
                        {
                            name: "Fakultas Teknik UI",
                            path: "/keorganisasian/komisariat/fakultas-teknik",
                        },
                        {
                            name: "Fakultas Ilmu Sosial dan Politik UI",
                            path: "/keorganisasian/komisariat/fakultas-ilmu-sosial-dan-politik",
                        },
                    ],
                },
                { name: "Kohati", path: "/keorganisasian/kohati" },
                { name: "BPL", path: "/keorganisasian/bpl" },
                {
                    name: "LPP",
                    path: "#",
                    submenu: [
                        {
                            name: "Korkom UI",
                            path: "/keorganisasian/lpp/LTMI",
                        },
                        {
                            name: "Korkom APP",
                            path: "/keorganisasian/lpp/LTI",
                        },
                    ],
                },
            ],
        },
        { name: "Berita", path: "/berita" },
        { name: "Opini", path: "/opini" },
        { name: "Latihan Kader", path: "/latihan-kader" },
        { name: "Kontak", path: "/kontak" },
    ];
    return (
        <TooltipProvider>
            <Toaster />
            <Sonner />
            {/* <Header /> */}
            <Navbar navItems={navItems} />
            {children}
            <Footer />
        </TooltipProvider>
    );
};
export default AppShell;
