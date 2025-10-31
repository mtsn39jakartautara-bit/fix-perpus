import React, { useState, useRef, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/Components/ui/button";
import logo from "@/assets/logo.png";
import { NavItem } from "@/types/navigation";

interface NavbarProps {
    navItems: NavItem[];
}

const Navbar: React.FC<NavbarProps> = ({ navItems }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(
        null
    );
    const [activeSubSubDropdown, setActiveSubSubDropdown] = useState<
        string | null
    >(null);

    const location =
        typeof window !== "undefined" ? window.location : { pathname: "/" };
    const navbarRef = useRef<HTMLDivElement>(null);

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close navbar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                navbarRef.current &&
                !navbarRef.current.contains(event.target as Node)
            ) {
                setIsMobileMenuOpen(false);
                setActiveDropdown(null);
                setActiveSubDropdown(null);
                setActiveSubSubDropdown(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Desktop handlers
    const handleDropdownToggle = (itemName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveDropdown(activeDropdown === itemName ? null : itemName);
        if (activeDropdown !== itemName) {
            setActiveSubDropdown(null);
            setActiveSubSubDropdown(null);
        }
    };

    const handleSubDropdownToggle = (itemName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveSubDropdown(activeSubDropdown === itemName ? null : itemName);
        if (activeSubDropdown !== itemName) {
            setActiveSubSubDropdown(null);
        }
    };

    // Mobile handlers
    const handleMobileDropdownToggle = (
        itemName: string,
        e: React.MouseEvent
    ) => {
        e.stopPropagation();
        if (activeDropdown === itemName) {
            setActiveDropdown(null);
            setActiveSubDropdown(null);
            setActiveSubSubDropdown(null);
        } else {
            setActiveDropdown(itemName);
            setActiveSubDropdown(null);
            setActiveSubSubDropdown(null);
        }
    };

    const handleMobileSubDropdownToggle = (
        itemName: string,
        e: React.MouseEvent
    ) => {
        e.stopPropagation();
        if (activeSubDropdown === itemName) {
            setActiveSubDropdown(null);
            setActiveSubSubDropdown(null);
        } else {
            setActiveSubDropdown(itemName);
            setActiveSubSubDropdown(null);
        }
    };

    const handleMobileSubSubDropdownToggle = (
        itemName: string,
        e: React.MouseEvent
    ) => {
        e.stopPropagation();
        if (activeSubSubDropdown === itemName) {
            setActiveSubSubDropdown(null);
        } else {
            setActiveSubSubDropdown(itemName);
        }
    };

    const handleMobileLinkClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
        setActiveSubDropdown(null);
        setActiveSubSubDropdown(null);
    };

    const isActivePath = (path: string) => {
        return location.pathname === path;
    };

    // Close all dropdowns when mobile menu closes
    useEffect(() => {
        if (!isMobileMenuOpen) {
            setActiveDropdown(null);
            setActiveSubDropdown(null);
            setActiveSubSubDropdown(null);
        }
    }, [isMobileMenuOpen]);

    const hasSubmenu = (item: NavItem): boolean => {
        return !!item.submenu && item.submenu.length > 0;
    };

    const hasSubSubmenu = (subItem: NavItem): boolean => {
        return !!subItem.submenu && subItem.submenu.length > 0;
    };

    return (
        <header
            ref={navbarRef}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                isScrolled
                    ? "bg-white shadow-md backdrop-blur-md"
                    : "bg-transparent"
            }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <img src={logo} alt="Logo" className="w-14 h-14" />
                        <div className="hidden md:block">
                            <div
                                className={`font-serif font-bold text-xl transition-colors duration-300 ${
                                    isScrolled
                                        ? "text-foreground"
                                        : "text-white"
                                }`}
                            >
                                HMI Cabang Depok
                            </div>
                            <div
                                className={`text-xs transition-colors duration-300 ${
                                    isScrolled
                                        ? "text-muted-foreground"
                                        : "text-white/80"
                                }`}
                            >
                                Himpunan Mahasiswa Islam
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {navItems.map((item) => (
                            <div key={item.name} className="relative group">
                                {hasSubmenu(item) ? (
                                    <div
                                        className="relative"
                                        onMouseEnter={() =>
                                            setActiveDropdown(item.name)
                                        }
                                        onMouseLeave={() =>
                                            setActiveDropdown(null)
                                        }
                                    >
                                        <button
                                            className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-all rounded-md duration-300 ${
                                                isActivePath(item.path) ||
                                                item.submenu?.some((sub) =>
                                                    isActivePath(sub.path)
                                                )
                                                    ? "text-primary"
                                                    : isScrolled
                                                    ? "text-foreground hover:text-primary"
                                                    : "text-white hover:text-primary/80"
                                            }`}
                                        >
                                            {item.name}
                                            <ChevronDown
                                                size={16}
                                                className={`transition-transform duration-200 ${
                                                    activeDropdown === item.name
                                                        ? "rotate-180"
                                                        : ""
                                                }`}
                                            />
                                        </button>

                                        {item.submenu && (
                                            <div
                                                className={`absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-lg shadow-lg transition-all duration-200 ${
                                                    activeDropdown === item.name
                                                        ? "opacity-100 visible translate-y-0"
                                                        : "opacity-0 invisible -translate-y-2"
                                                }`}
                                            >
                                                {item.submenu.map((subitem) => (
                                                    <div
                                                        key={subitem.name}
                                                        className="relative"
                                                    >
                                                        {hasSubSubmenu(
                                                            subitem
                                                        ) ? (
                                                            <div
                                                                className="relative"
                                                                onMouseEnter={() =>
                                                                    setActiveSubDropdown(
                                                                        subitem.name
                                                                    )
                                                                }
                                                                onMouseLeave={() =>
                                                                    setActiveSubDropdown(
                                                                        null
                                                                    )
                                                                }
                                                            >
                                                                <button
                                                                    className={`flex items-center justify-between w-full px-4 py-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                                                        isActivePath(
                                                                            subitem.path
                                                                        )
                                                                            ? "bg-accent text-accent-foreground"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    {
                                                                        subitem.name
                                                                    }
                                                                    <ChevronDown
                                                                        size={
                                                                            14
                                                                        }
                                                                        className={`transition-transform duration-200 ${
                                                                            activeSubDropdown ===
                                                                            subitem.name
                                                                                ? "rotate-180"
                                                                                : ""
                                                                        }`}
                                                                    />
                                                                </button>

                                                                {subitem.submenu && (
                                                                    <div
                                                                        className={`absolute left-full top-0 ml-1 w-56 bg-card border border-border rounded-lg shadow-lg transition-all duration-200 ${
                                                                            activeSubDropdown ===
                                                                            subitem.name
                                                                                ? "opacity-100 visible translate-x-0"
                                                                                : "opacity-0 invisible -translate-x-2"
                                                                        }`}
                                                                    >
                                                                        {subitem.submenu.map(
                                                                            (
                                                                                subsubitem
                                                                            ) => (
                                                                                <Link
                                                                                    key={
                                                                                        subsubitem.name
                                                                                    }
                                                                                    href={
                                                                                        subsubitem.path
                                                                                    }
                                                                                    className={`block px-4 py-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                                                                        isActivePath(
                                                                                            subsubitem.path
                                                                                        )
                                                                                            ? "bg-accent text-accent-foreground"
                                                                                            : ""
                                                                                    }`}
                                                                                >
                                                                                    {
                                                                                        subsubitem.name
                                                                                    }
                                                                                </Link>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <Link
                                                                href={
                                                                    subitem.path
                                                                }
                                                                className={`block px-4 py-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                                                    isActivePath(
                                                                        subitem.path
                                                                    )
                                                                        ? "bg-accent text-accent-foreground"
                                                                        : ""
                                                                }`}
                                                            >
                                                                {subitem.name}
                                                            </Link>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        href={item.path}
                                        className={`px-4 py-2 text-sm font-medium transition-all rounded-md duration-300 ${
                                            isActivePath(item.path)
                                                ? "text-primary"
                                                : isScrolled
                                                ? "text-foreground hover:text-primary"
                                                : "text-white hover:text-primary/80"
                                        }`}
                                    >
                                        {item.name}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* CTA Button + Mobile Button */}
                    <div className="flex items-center gap-3">
                        <Button
                            asChild
                            className={`font-semibold px-6 transition-all duration-300 ${
                                isScrolled
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                            }`}
                        >
                            <Link
                                href="https://forms.google.com/your-form-url"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Daftar HMI
                            </Link>
                        </Button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                            className={`lg:hidden p-2 transition-colors duration-300 ${
                                isScrolled
                                    ? "text-foreground hover:text-primary"
                                    : "text-white hover:text-primary/80"
                            }`}
                        >
                            {isMobileMenuOpen ? (
                                <X size={24} />
                            ) : (
                                <Menu size={24} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-border bg-background/95 backdrop-blur-md">
                        <nav className="flex flex-col gap-1">
                            {navItems.map((item) => (
                                <div key={item.name} className="px-2">
                                    {hasSubmenu(item) ? (
                                        <div className="relative">
                                            {/* Dropdown Utama */}
                                            <button
                                                onClick={(e) =>
                                                    handleMobileDropdownToggle(
                                                        item.name,
                                                        e
                                                    )
                                                }
                                                className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                                                    isActivePath(item.path) ||
                                                    item.submenu?.some((sub) =>
                                                        isActivePath(sub.path)
                                                    )
                                                        ? "bg-accent text-accent-foreground"
                                                        : "text-foreground hover:bg-accent/50"
                                                }`}
                                            >
                                                <span>{item.name}</span>
                                                <ChevronDown
                                                    size={16}
                                                    className={`transition-transform duration-200 ${
                                                        activeDropdown ===
                                                        item.name
                                                            ? "rotate-180"
                                                            : ""
                                                    }`}
                                                />
                                            </button>

                                            {/* Isi Dropdown Utama */}
                                            {activeDropdown === item.name && (
                                                <div
                                                    className="ml-4 mt-1 space-y-1 border-l-2 border-border/50 pl-3"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    {item.submenu!.map(
                                                        (subitem) => (
                                                            <div
                                                                key={
                                                                    subitem.name
                                                                }
                                                            >
                                                                {hasSubSubmenu(
                                                                    subitem
                                                                ) ? (
                                                                    <>
                                                                        {/* Tombol Sub Dropdown */}
                                                                        <button
                                                                            onClick={(
                                                                                e
                                                                            ) => {
                                                                                e.stopPropagation();
                                                                                handleMobileSubDropdownToggle(
                                                                                    subitem.name,
                                                                                    e
                                                                                );
                                                                            }}
                                                                            className={`flex items-center justify-between w-full px-4 py-2 text-sm rounded-md transition-colors ${
                                                                                isActivePath(
                                                                                    subitem.path
                                                                                ) ||
                                                                                subitem.submenu?.some(
                                                                                    (
                                                                                        s
                                                                                    ) =>
                                                                                        isActivePath(
                                                                                            s.path
                                                                                        )
                                                                                )
                                                                                    ? "text-accent-foreground"
                                                                                    : "text-muted-foreground hover:text-foreground "
                                                                            }`}
                                                                        >
                                                                            <span>
                                                                                {
                                                                                    subitem.name
                                                                                }
                                                                            </span>
                                                                            <ChevronDown
                                                                                size={
                                                                                    14
                                                                                }
                                                                                className={`transition-transform duration-200 ${
                                                                                    activeSubDropdown ===
                                                                                    subitem.name
                                                                                        ? "rotate-180"
                                                                                        : ""
                                                                                }`}
                                                                            />
                                                                        </button>

                                                                        {/* Isi Sub Dropdown */}
                                                                        {activeSubDropdown ===
                                                                            subitem.name && (
                                                                            <div
                                                                                className="ml-4 mt-1 space-y-1 border-l-2 border-border/30 pl-3"
                                                                                onClick={(
                                                                                    e
                                                                                ) =>
                                                                                    e.stopPropagation()
                                                                                }
                                                                            >
                                                                                {subitem.submenu!.map(
                                                                                    (
                                                                                        subsubitem
                                                                                    ) => (
                                                                                        <div
                                                                                            key={
                                                                                                subsubitem.name
                                                                                            }
                                                                                        >
                                                                                            {hasSubSubmenu(
                                                                                                subsubitem
                                                                                            ) ? (
                                                                                                <>
                                                                                                    {/* Tombol Sub Sub Dropdown */}
                                                                                                    <button
                                                                                                        onClick={(
                                                                                                            e
                                                                                                        ) => {
                                                                                                            e.stopPropagation();
                                                                                                            handleMobileSubSubDropdownToggle(
                                                                                                                subsubitem.name,
                                                                                                                e
                                                                                                            );
                                                                                                        }}
                                                                                                        className={`flex items-center justify-between w-full px-4 py-2 text-sm rounded-md transition-colors ${
                                                                                                            isActivePath(
                                                                                                                subsubitem.path
                                                                                                            )
                                                                                                                ? "text-accent-foreground bg-accent/50"
                                                                                                                : "text-muted-foreground hover:text-foreground hover:bg-accent/30 "
                                                                                                        }`}
                                                                                                    >
                                                                                                        <span>
                                                                                                            {
                                                                                                                subsubitem.name
                                                                                                            }
                                                                                                        </span>
                                                                                                        <ChevronDown
                                                                                                            size={
                                                                                                                12
                                                                                                            }
                                                                                                            className={`transition-transform duration-200 ${
                                                                                                                activeSubSubDropdown ===
                                                                                                                subsubitem.name
                                                                                                                    ? "rotate-180"
                                                                                                                    : ""
                                                                                                            }`}
                                                                                                        />
                                                                                                    </button>

                                                                                                    {/* Isi Sub Sub Dropdown */}
                                                                                                    {activeSubSubDropdown ===
                                                                                                        subsubitem.name && (
                                                                                                        <div
                                                                                                            className="ml-4 mt-1 space-y-1 border-l-2 border-border/20 pl-3"
                                                                                                            onClick={(
                                                                                                                e
                                                                                                            ) =>
                                                                                                                e.stopPropagation()
                                                                                                            }
                                                                                                        >
                                                                                                            {subsubitem.submenu!.map(
                                                                                                                (
                                                                                                                    subsubsubitem
                                                                                                                ) => (
                                                                                                                    <Link
                                                                                                                        key={
                                                                                                                            subsubsubitem.name
                                                                                                                        }
                                                                                                                        href={
                                                                                                                            subsubsubitem.path
                                                                                                                        }
                                                                                                                        onClick={
                                                                                                                            handleMobileLinkClick
                                                                                                                        }
                                                                                                                        className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                                                                                                                            isActivePath(
                                                                                                                                subsubsubitem.path
                                                                                                                            )
                                                                                                                                ? "text-accent-foreground bg-accent/50"
                                                                                                                                : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                                                                                                                        }`}
                                                                                                                    >
                                                                                                                        {
                                                                                                                            subsubsubitem.name
                                                                                                                        }
                                                                                                                    </Link>
                                                                                                                )
                                                                                                            )}
                                                                                                        </div>
                                                                                                    )}
                                                                                                </>
                                                                                            ) : (
                                                                                                <Link
                                                                                                    href={
                                                                                                        subsubitem.path
                                                                                                    }
                                                                                                    onClick={
                                                                                                        handleMobileLinkClick
                                                                                                    }
                                                                                                    className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                                                                                                        isActivePath(
                                                                                                            subsubitem.path
                                                                                                        )
                                                                                                            ? "text-accent-foreground bg-accent/50"
                                                                                                            : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                                                                                                    }`}
                                                                                                >
                                                                                                    {
                                                                                                        subsubitem.name
                                                                                                    }
                                                                                                </Link>
                                                                                            )}
                                                                                        </div>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <Link
                                                                        href={
                                                                            subitem.path
                                                                        }
                                                                        onClick={
                                                                            handleMobileLinkClick
                                                                        }
                                                                        className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                                                                            isActivePath(
                                                                                subitem.path
                                                                            )
                                                                                ? "text-accent-foreground bg-accent/50"
                                                                                : "text-muted-foreground hover:text-foreground hover:bg-accent/30 "
                                                                        }`}
                                                                    >
                                                                        {
                                                                            subitem.name
                                                                        }
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <Link
                                            href={item.path}
                                            onClick={handleMobileLinkClick}
                                            className={`block px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                                                isActivePath(item.path)
                                                    ? "bg-accent text-accent-foreground"
                                                    : "text-foreground hover:bg-accent/50"
                                            }`}
                                        >
                                            {item.name}
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
