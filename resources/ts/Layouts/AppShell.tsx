import { Link, router, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    LogOut,
    LibraryIcon,
    QrCode,
    BookMarkedIcon,
    HeartPlusIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { Toaster } from "sonner";

const navItems = [
    {
        route: "dashboard.index",
        label: "Dashboard",
        icon: LayoutDashboard,
    },
    { route: "perpus.index", label: "Perpus", icon: LibraryIcon },
    {
        route: "visits.index",
        label: "Kunjungan",
        icon: QrCode,
        isCenter: true,
    },
    {
        route: "borrowing.index",
        label: "Pinjaman",
        icon: BookMarkedIcon,
    },
    {
        route: "wishlist.index",
        label: "Wishlist",
        icon: HeartPlusIcon,
    },
];

// Helper function untuk mengecek apakah path active
function isPathActive(currentPath: string, itemRouteName: string): boolean {
    const itemPath = route(itemRouteName);

    const getPathFromUrl = (url: string | any) => {
        try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.pathname;
        } catch {
            // Jika bukan URL lengkap, asumsikan sebagai path
            return url.split("?")[0]; // Hilangkan query string
        }
    };

    // Hilangkan query string dari current path
    const cleanCurrentPath = currentPath.split("?")[0];
    const normalizedCurrent = getPathFromUrl(cleanCurrentPath).replace(
        /\/$/,
        ""
    );
    const normalizedItemPath = getPathFromUrl(itemPath).replace(/\/$/, "");

    if (normalizedCurrent === normalizedItemPath) {
        return true;
    }

    if (normalizedCurrent.startsWith(normalizedItemPath + "/")) {
        return true;
    }

    return false;
}

export function AppShell({ children }: { children: React.ReactNode }) {
    const { url } = usePage();
    const pathname = url;

    const handleLogout = () => {
        router.post(route("logout"));
    };

    return (
        <>
            <Toaster position="top-right" />
            <div className="min-h-screen bg-background">
                {/* Desktop sidebar */}
                <aside className="fixed left-0 top-0 hidden h-screen w-72 flex-col gap-2 border-r border-border/60 bg-card/60 p-6 backdrop-blur-xl lg:flex">
                    <Link
                        href={route("dashboard.index")}
                        className="mb-8 flex items-center gap-3"
                    >
                        <img
                            src="/assets/images/logo.webp"
                            alt=""
                            className="h-11 w-11"
                        />
                        <div>
                            <p className="text-base font-bold tracking-tight">
                                MTsN 39 Jakarta
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Asy-Syifa Binti Abdillah
                            </p>
                        </div>
                    </Link>

                    <nav className="flex flex-1 flex-col gap-1.5">
                        {navItems.map((item, index) => {
                            const active = isPathActive(pathname, item.route);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={index + 1}
                                    href={route(item.route)}
                                    className="relative"
                                >
                                    {active && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute inset-0 rounded-2xl bg-gradient-primary shadow-soft"
                                            transition={{
                                                type: "spring",
                                                stiffness: 380,
                                                damping: 32,
                                            }}
                                        />
                                    )}
                                    <div
                                        className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                                            active
                                                ? "text-primary-foreground"
                                                : "text-muted-foreground hover:bg-primary-soft hover:text-foreground"
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {item.label}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                        <LogOut className="h-5 w-5" /> Keluar
                    </button>
                </aside>

                <main className="pb-28 lg:ml-72 lg:pb-8">{children}</main>

                {/* Mobile bottom nav dengan efek melengkung */}
                <nav className="fixed bottom-4 left-1/2 z-50 flex w-[92%] max-w-md -translate-x-1/2 items-center justify-between rounded-3xl border border-border/60 bg-card/90 px-3 py-2.5 shadow-float backdrop-blur-xl lg:hidden">
                    {navItems.map((item, index) => {
                        const active = isPathActive(pathname, item.route);
                        const Icon = item.icon;
                        const isCenter = item.isCenter || false;

                        // Jika item center, render dengan gaya khusus
                        if (isCenter) {
                            return (
                                <Link
                                    key={index + 1}
                                    href={route(item.route)}
                                    className="relative -mt-16" // Tambah margin top lebih besar
                                >
                                    <div className="relative flex flex-col items-center">
                                        {/* Efek lengkungan/cutout di nav bar */}
                                        <div className="absolute -top-2 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-card/90 backdrop-blur-xl" />

                                        {/* Efek bayangan untuk floating */}
                                        <div className="absolute -bottom-2 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-primary/20 blur-xl" />

                                        {/* Tombol utama dengan icon */}
                                        <div className="relative">
                                            {active && (
                                                <motion.div
                                                    layoutId="mobile-center-active"
                                                    className="absolute inset-0 rounded-full bg-gradient-primary"
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 380,
                                                        damping: 32,
                                                    }}
                                                />
                                            )}
                                            <div
                                                className={`relative flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
                                                    active
                                                        ? "bg-gradient-primary text-primary-foreground shadow-primary/50 scale-110"
                                                        : "bg-gradient-to-br from-primary to-primary/80 text-white hover:scale-105 hover:shadow-xl"
                                                }`}
                                            >
                                                <Icon className="h-8 w-8" />
                                            </div>
                                        </div>

                                        {/* Label untuk center item (opsional, jika ingin ditampilkan) */}
                                        {!active && (
                                            <span className="absolute -bottom-6 text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                                                {item.label}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            );
                        }

                        // Render normal untuk item lainnya
                        return (
                            <Link
                                key={index + 1}
                                href={route(item.route)}
                                className="relative flex-1 flex justify-center"
                            >
                                <div className="relative flex flex-col items-center gap-0.5 py-1.5">
                                    {active && (
                                        <motion.div
                                            layoutId="mobile-active"
                                            className="absolute inset-0 rounded-full bg-gradient-primary"
                                            transition={{
                                                type: "spring",
                                                stiffness: 380,
                                                damping: 32,
                                            }}
                                        />
                                    )}
                                    <div className="relative flex flex-col items-center gap-0.5 px-3 py-1.5">
                                        <Icon
                                            className={`relative h-5 w-5 transition-colors ${
                                                active
                                                    ? "text-primary-foreground"
                                                    : "text-muted-foreground"
                                            }`}
                                        />
                                        {/* Label hanya ditampilkan jika tidak active */}
                                        {!active && (
                                            <span
                                                className={`relative text-[10px] font-medium transition-colors whitespace-nowrap ${
                                                    active
                                                        ? "text-primary-foreground"
                                                        : "text-muted-foreground"
                                                }`}
                                            >
                                                {item.label === "Dashboard" ? (
                                                    <span>Beranda</span>
                                                ) : (
                                                    <span>{item.label}</span>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}
