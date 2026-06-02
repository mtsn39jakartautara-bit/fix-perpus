// Layouts/AdminLayout.tsx
import { Link, router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    LogOut,
    LibraryIcon,
    QrCode,
    BookMarkedIcon,
    Users,
    BookOpen,
    ChevronDown,
    Menu,
    X,
    Settings,
    FileText,
    Calendar,
    Award,
    BookCopy,
    Megaphone,
    BookUp2,
    BookDownIcon,
    BookUp,
    UserPlus2Icon,
    GraduationCap,
    ExternalLink,
    ArrowUpCircle,
    Move3dIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { Toaster } from "sonner";

// Interface untuk item menu
interface MenuItem {
    route?: string;
    label: string;
    icon: any;
    isCenter?: boolean;
    children?: MenuItem[];
}

// Konfigurasi menu admin
const adminMenuItems: MenuItem[] = [
    {
        route: "admin.dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "M - Perpustakaan",
        icon: LibraryIcon,
        children: [
            {
                route: "admin.books.digital.index",
                label: "Buku Digital",
                icon: BookOpen,
            },
            {
                route: "admin.books.physical.index",
                label: "Buku Fisik",
                icon: BookCopy,
            },
            {
                route: "admin.categories.index",
                label: "Kategori",
                icon: FileText,
            },
        ],
    },
    {
        label: "M - User",
        icon: Users,
        children: [
            {
                route: "admin.users.students",
                label: "Siswa",
                icon: Users,
            },
            {
                route: "admin.users.teachers",
                label: "Guru",
                icon: Users,
            },
            {
                route: "admin.users.external",
                label: "Eksternal",
                icon: Users,
            },
        ],
    },
    {
        label: "M - Peminjaman",
        icon: BookMarkedIcon,
        children: [
            {
                route: "admin.borrowing.index",
                label: "Peminjaman",
                icon: BookUp,
            },
            {
                route: "admin.returns.index",
                label: "Pengembalian",
                icon: BookDownIcon,
            },
        ],
    },
    {
        route: "admin.visits.index",
        label: "Kunjungan",
        icon: QrCode,
    },
    {
        label: "Akademik",
        icon: Calendar,
        children: [
            {
                route: "admin.classes.index",
                label: "Kelas",
                icon: Calendar,
            },
            {
                route: "admin.academic-years.index",
                label: "Tahun Ajaran",
                icon: Calendar,
            },
            {
                route: "admin.class-promotion",
                label: "Promosi Kelas / Lulus",
                icon: ArrowUpCircle,
            },
            {
                route: "admin.student-status",
                label: "Pindah / Drop Out",
                icon: Move3dIcon,
            },
        ],
    },
    {
        label: "Tambah Users",
        icon: Calendar,
        children: [
            {
                route: "admin.students.upload",
                label: "Siswa",
                icon: UserPlus2Icon,
            },
            {
                route: "admin.teachers.upload",
                label: "Guru",
                icon: GraduationCap,
            },
            {
                route: "admin.externals.upload",
                label: "Eksternal",
                icon: ExternalLink,
            },
        ],
    },
    {
        route: "admin.points.index",
        label: "Point Ranking",
        icon: Award,
    },
    {
        route: "admin.announcements.index",
        label: "Pengumuman",
        icon: Megaphone,
    },
    {
        route: "admin.settings",
        label: "Pengaturan",
        icon: Settings,
    },
];

// Helper function untuk mengecek apakah path active
function isPathActive(currentPath: string, itemRouteName?: string): boolean {
    if (!itemRouteName) return false;

    try {
        const itemPath = route(itemRouteName);
        const cleanCurrentPath = currentPath.split("?")[0];
        const normalizedCurrent = cleanCurrentPath?.replace(/\/$/, "");
        const normalizedItemPath = itemPath.replace(/\/$/, "");

        if (normalizedCurrent === normalizedItemPath) return true;
        if (normalizedCurrent?.startsWith(normalizedItemPath + "/"))
            return true;

        return false;
    } catch {
        return false;
    }
}

// Component untuk menu item dengan submenu
function MenuItemComponent({
    item,
    pathname,
    level = 0,
}: {
    item: MenuItem;
    pathname: string;
    level?: number;
}) {
    const { openMenus, toggleMenu } = useSidebar();
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.route ? isPathActive(pathname, item.route) : false;

    // Gunakan state dari context
    const isOpen = hasChildren ? openMenus[item.label] || false : false;
    const isChildActive =
        hasChildren &&
        item.children?.some(
            (child) => child.route && isPathActive(pathname, child.route)
        );

    // Auto expand jika child active (tanpa useEffect karena menggunakan context)
    useEffect(() => {
        if (isChildActive && !isOpen && hasChildren) {
            toggleMenu(item.label);
        }
    }, [isChildActive]);

    const Icon = item.icon;

    const handleToggle = () => {
        if (hasChildren) {
            toggleMenu(item.label);
        }
    };

    if (hasChildren) {
        return (
            <div className="w-full">
                <button
                    onClick={handleToggle}
                    className={`relative flex w-full items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isChildActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                    }`}
                    style={{ paddingLeft: `${1 + level * 1.5}rem` }}
                >
                    <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                    </div>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="h-3.5 w-3.5" />
                    </motion.div>
                </button>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            {item.children?.map((child, idx) => (
                                <MenuItemComponent
                                    key={idx}
                                    item={child}
                                    pathname={pathname}
                                    level={level + 1}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <Link href={route(item.route!)} className="relative block">
            {isActive && (
                <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-primary shadow-sm"
                    transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                    }}
                />
            )}
            <div
                className={`relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                        ? "text-white"
                        : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                }`}
                style={{ paddingLeft: `${1 + level * 1.5}rem` }}
            >
                <Icon className="h-4 w-4" />
                {item.label}
            </div>
        </Link>
    );
}

// Mobile Sidebar Component
function MobileSidebar({
    isOpen,
    onClose,
    pathname,
}: {
    isOpen: boolean;
    onClose: () => void;
    pathname: string;
}) {
    const handleLogout = () => {
        router.post(route("logout"));
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    />

                    {/* Sidebar */}
                    <motion.aside
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 200,
                        }}
                        className="fixed left-0 top-0 z-50 h-screen w-80 flex-col bg-card shadow-2xl lg:hidden"
                    >
                        <div className="flex h-full flex-col">
                            <div className="border-b border-border p-5">
                                <div className="flex items-center justify-between">
                                    <Link
                                        href={route("admin.dashboard")}
                                        className="flex items-center gap-3"
                                        onClick={onClose}
                                    >
                                        <img
                                            src="/assets/images/logo.webp"
                                            alt="Logo"
                                            className="h-10 w-10 rounded-xl"
                                        />
                                        <div>
                                            <p className="text-sm font-bold tracking-tight">
                                                MTsN 39 Jakarta
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Panel Admin
                                            </p>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={onClose}
                                        className="rounded-lg p-2 hover:bg-muted"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <nav className="flex-1 overflow-y-auto p-3">
                                {adminMenuItems.map((item, index) => (
                                    <MenuItemComponent
                                        key={index}
                                        item={item}
                                        pathname={pathname}
                                    />
                                ))}
                            </nav>

                            <div className="border-t border-border p-3">
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50"
                                >
                                    <LogOut className="h-4 w-4" /> Keluar
                                </button>
                            </div>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}

// Komponen dalam yang menggunakan useSidebar
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { url } = usePage();
    const pathname = url;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Detect screen size
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);

        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    // Detect scroll for header effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        router.post(route("logout"));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 hidden h-screen w-72 flex-col bg-card/95 backdrop-blur-xl shadow-2xl lg:flex">
                {/* Sidebar Top dengan rounded kanan atas */}
                <div className="relative overflow-hidden">
                    <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/20" />
                    <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-primary/10" />

                    <Link
                        href={route("admin.dashboard")}
                        className="relative z-10 flex items-center gap-3 border-b border-border p-6"
                    >
                        <img
                            src="/assets/images/logo.webp"
                            alt="Logo"
                            className="h-11 w-11 rounded-xl shadow-md"
                        />
                        <div>
                            <p className="text-base font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                MTsN 39 Jakarta
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Panel Administrator
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4">
                    {adminMenuItems.map((item, index) => (
                        <MenuItemComponent
                            key={index}
                            item={item}
                            pathname={pathname}
                        />
                    ))}
                </nav>

                {/* Sidebar Bottom dengan rounded kanan bawah */}
                <div className="relative overflow-hidden border-t border-border p-4">
                    <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-primary/20" />
                    <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-primary/10" />

                    <button
                        onClick={handleLogout}
                        className="relative z-10 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50"
                    >
                        <LogOut className="h-4 w-4" /> Keluar
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={`min-h-screen ${!isMobile ? "lg:ml-72" : ""}`}>
                {/* Header dengan efek rounded */}
                <div
                    className={`sticky top-0 z-20 transition-all duration-300 ${
                        scrolled
                            ? "bg-card/95 shadow-lg backdrop-blur-xl"
                            : "bg-transparent"
                    }`}
                >
                    <div className="relative">
                        {/* Efek rounded kanan atas */}
                        <div className="absolute -right-0 -top-0 h-48 w-48 overflow-hidden pointer-events-none">
                            <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-primary/10" />
                            <div className="absolute -right-36 -top-36 h-64 w-64 rounded-full bg-primary/5" />
                        </div>

                        <div className="container mx-auto px-4 py-4 md:px-6 lg:px-8">
                            <div className="flex items-center justify-between">
                                {/* Mobile Menu Button */}
                                {isMobile && (
                                    <button
                                        onClick={() =>
                                            setIsMobileMenuOpen(true)
                                        }
                                        className="rounded-xl bg-card p-2 shadow-md hover:bg-muted transition-all"
                                    >
                                        <Menu className="h-5 w-5" />
                                    </button>
                                )}

                                {/* Page Title - bisa ditambahkan nanti */}
                                <div className="flex-1" />

                                {/* User Info / Avatar */}
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center shadow-md">
                                        <span className="text-sm font-bold text-white">
                                            A
                                        </span>
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="text-sm font-medium">
                                            Admin
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Administrator
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="relative">
                    {/* Efek rounded kanan bawah pada content */}
                    <div className="absolute -bottom-0 -right-0 h-64 w-64 overflow-hidden pointer-events-none z-0">
                        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-primary/5" />
                        <div className="absolute -bottom-48 -right-48 h-96 w-96 rounded-full bg-primary/3" />
                    </div>

                    <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8 relative z-10">
                        {children}
                    </div>
                </div>
            </main>

            {/* Mobile Sidebar */}
            <MobileSidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                pathname={pathname}
            />
        </div>
    );
}

// Main Admin Layout Component - dibungkus dengan SidebarProvider
export function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <Toaster position="top-right" />
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </SidebarProvider>
    );
}
