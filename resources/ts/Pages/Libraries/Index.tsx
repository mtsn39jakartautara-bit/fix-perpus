import { AppShell } from "@/Layouts/AppShell";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen,
    Search,
    ChevronLeft,
    ChevronRight,
    X,
    Filter,
    ChevronDown,
    BookMarked,
    Library,
    Sparkles,
    TrendingUp,
} from "lucide-react";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Head, router, usePage } from "@inertiajs/react";

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Book {
    id: number;
    uuid: string;
    title: string;
    author: string;
    categories: Category[];
    bg: string;
    cover?: string;
    book_code: string;
}

interface PaginationProps {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function LibraryPage() {
    const { books, pagination, categories, totalBooks } = usePage<{
        books: Book[];
        pagination: PaginationProps;
        categories: Category[];
        totalBooks: number;
    }>().props;

    // Ambil parameter dari URL saat initial load
    const getInitialSearch = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("search") || "";
    };

    const getInitialCategory = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("category") || "";
    };

    const [searchTerm, setSearchTerm] = useState(getInitialSearch);
    const [debouncedSearch, setDebouncedSearch] = useState(getInitialSearch);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedCategory, setSelectedCategory] =
        useState<string>(getInitialCategory);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const isUpdatingFromUrl = useRef(false);

    // Sinkronkan state dengan URL saat halaman di-refresh atau navigasi back/forward
    useEffect(() => {
        const handlePopState = () => {
            const searchFromUrl = getInitialSearch();
            const categoryFromUrl = getInitialCategory();

            isUpdatingFromUrl.current = true;

            if (searchFromUrl !== searchTerm) {
                setSearchTerm(searchFromUrl);
                setDebouncedSearch(searchFromUrl);
            }

            if (categoryFromUrl !== selectedCategory) {
                setSelectedCategory(categoryFromUrl);
            }

            setTimeout(() => {
                isUpdatingFromUrl.current = false;
            }, 100);
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    // Debounce search dengan cleanup yang lebih baik
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        setIsSearching(true);

        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setIsSearching(false);
        }, 500);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm]);

    // Trigger search and filter when values change - FIXED INFINITE LOOP
    useEffect(() => {
        // Cegah update jika sedang sync dari URL
        if (isUpdatingFromUrl.current) {
            return;
        }

        // Cegah infinite loop dengan membandingkan dengan URL saat ini
        const urlParams = new URLSearchParams(window.location.search);
        const currentSearch = urlParams.get("search") || "";
        const currentCategory = urlParams.get("category") || "";

        // Jika nilai sudah sama dengan URL, tidak perlu update
        if (
            debouncedSearch === currentSearch &&
            selectedCategory === currentCategory
        ) {
            if (isInitialLoad) {
                setIsInitialLoad(false);
            }
            return;
        }

        // Cegah update ganda saat initial load
        if (
            isInitialLoad &&
            debouncedSearch === "" &&
            selectedCategory === "" &&
            currentSearch === "" &&
            currentCategory === ""
        ) {
            setIsInitialLoad(false);
            return;
        }

        const params: any = { page: 1 };
        if (debouncedSearch) params.search = debouncedSearch;
        if (selectedCategory) params.category = selectedCategory;

        router.get(route("perpus.index"), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [debouncedSearch, selectedCategory]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowCategoryDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlePageChange = (page: number) => {
        const params: any = { page };
        if (searchTerm) params.search = searchTerm;
        if (selectedCategory) params.category = selectedCategory;

        router.get(route("perpus.index"), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setDebouncedSearch("");
    };

    const handleClearCategory = () => {
        setSelectedCategory("");
        setShowCategoryDropdown(false);
    };

    const getCategoryName = (slug: string) => {
        const category = categories.find((c) => c.slug === slug);
        return category ? category.name : "Semua Kategori";
    };

    // Get primary color gradient (hsl(180 92% 26%))
    const getPrimaryGradient = () => {
        return "from-[hsl(180,92%,26%)] to-[hsl(180,92%,20%)]";
    };

    return (
        <>
            <Head title="Perpustakaan" />

            <AppShell>
                <div className="min-h-screen bg-gradient-soft lg:bg-none">
                    <div className="mx-auto max-w-7xl px-5 pt-8 pb-24 lg:px-10 lg:pt-10">
                        {/* Header with Library vibe */}
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
                                Perpustakaan Digital
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                {totalBooks}+ buku tersedia untuk dibaca
                            </p>
                        </div>

                        {/* Search and Filter Section */}
                        <div className="mb-8 space-y-4">
                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari buku, penulis, atau kategori..."
                                    className="h-14 rounded-2xl border-0 bg-card pl-14 pr-12 text-base shadow-soft"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />

                                {isSearching &&
                                    searchTerm !== debouncedSearch && (
                                        <div className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2">
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        </div>
                                    )}

                                {searchTerm && !isSearching && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>

                            {/* Filter Dropdown */}
                            <div className="flex items-center justify-between gap-4">
                                <div
                                    className="relative z-20"
                                    ref={dropdownRef}
                                >
                                    <Button
                                        onClick={() =>
                                            setShowCategoryDropdown(
                                                !showCategoryDropdown
                                            )
                                        }
                                        variant="outline"
                                        className="gap-2 rounded-xl border-0 bg-card px-4 py-2 shadow-soft"
                                    >
                                        <Filter className="h-4 w-4" />
                                        <span>
                                            {getCategoryName(selectedCategory)}
                                        </span>
                                        <ChevronDown
                                            className={`h-4 w-4 transition-transform ${
                                                showCategoryDropdown
                                                    ? "rotate-180"
                                                    : ""
                                            }`}
                                        />
                                    </Button>

                                    <AnimatePresence>
                                        {showCategoryDropdown && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl bg-card shadow-xl"
                                            >
                                                <div className="p-2">
                                                    <button
                                                        onClick={
                                                            handleClearCategory
                                                        }
                                                        className="w-full rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                                                    >
                                                        Semua Kategori
                                                    </button>
                                                    {categories.map(
                                                        (category) => (
                                                            <button
                                                                key={
                                                                    category.id
                                                                }
                                                                onClick={() => {
                                                                    setSelectedCategory(
                                                                        category.slug
                                                                    );
                                                                    setShowCategoryDropdown(
                                                                        false
                                                                    );
                                                                }}
                                                                className="w-full rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                                                            >
                                                                {category.name}
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {selectedCategory && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearCategory}
                                        className="text-xs text-muted-foreground"
                                    >
                                        <X className="mr-1 h-3 w-3" />
                                        Hapus Filter
                                    </Button>
                                )}
                            </div>
                        </div>

                        {books.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-12 rounded-3xl bg-card p-16 text-center shadow-soft"
                            >
                                <BookOpen
                                    className="mx-auto h-16 w-16 text-muted-foreground/40"
                                    strokeWidth={1.5}
                                />
                                <p className="mt-4 text-lg font-medium text-foreground">
                                    Buku tidak ditemukan
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Coba dengan kata kunci atau kategori yang
                                    berbeda
                                </p>
                                {(searchTerm || selectedCategory) && (
                                    <Button
                                        variant="outline"
                                        className="mt-4 rounded-xl"
                                        onClick={() => {
                                            handleClearSearch();
                                            handleClearCategory();
                                        }}
                                    >
                                        Hapus filter
                                    </Button>
                                )}
                            </motion.div>
                        ) : (
                            <>
                                {/* Book Grid - Like a real library shelf */}
                                <div className="mt-8">
                                    {/* Shelf decoration */}
                                    <div className="mb-6 flex items-center gap-2">
                                        <div className="h-px flex-1 bg-primary" />
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {pagination.total} buku ditemukan
                                        </span>
                                        <div className="h-px flex-1 bg-primary" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                        {books.map((book, index) => (
                                            <motion.div
                                                key={book.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: Math.min(
                                                        index * 0.03,
                                                        0.5
                                                    ),
                                                }}
                                                className="group cursor-pointer"
                                                onClick={() =>
                                                    router.get(
                                                        route("perpus.show", {
                                                            uuid: book.uuid,
                                                        })
                                                    )
                                                }
                                            >
                                                {/* Book Card - Like a real book */}
                                                <div className="relative transition-all duration-300 group-hover:-translate-y-2">
                                                    {/* Book shadow - lower z-index */}
                                                    <div className="absolute -bottom-2 left-2 right-2 h-4 rounded-full bg-black/20 opacity-0 blur-md transition-opacity group-hover:opacity-100 -z-10" />

                                                    {/* Book cover */}
                                                    <div className="relative overflow-hidden rounded-xl shadow-lg transition-all group-hover:shadow-inner">
                                                        {/* Book content with primary color gradient */}
                                                        <div
                                                            className={`relative flex flex-col bg-gradient-to-br ${getPrimaryGradient()} p-4 shadow-inner`}
                                                        >
                                                            {/* Cover image or placeholder */}
                                                            <div className="relative aspect-[3/4] w-full">
                                                                {book.cover ? (
                                                                    <img
                                                                        src={
                                                                            book.cover
                                                                        }
                                                                        alt={
                                                                            book.title
                                                                        }
                                                                        className="h-full w-full object-cover"
                                                                        loading="lazy"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                                                                        <BookMarked
                                                                            className="h-12 w-12 text-white/60"
                                                                            strokeWidth={
                                                                                1
                                                                            }
                                                                        />
                                                                        <div className="text-center">
                                                                            <p className="text-xs font-medium text-white/80">
                                                                                E-Book
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Book mark ribbon */}
                                                                <div className="absolute -right-5 -top-10 h-12 w-12 rotate-[-5deg] bg-amber-400 shadow-md" />
                                                            </div>

                                                            {/* Book info overlay on hover */}
                                                            <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 transition-opacity group-hover:opacity-100">
                                                                <p className="line-clamp-2 text-xs font-medium text-white">
                                                                    {book.title}
                                                                </p>
                                                                <p className="mt-1 text-[10px] text-white/80">
                                                                    {
                                                                        book.author
                                                                    }
                                                                </p>
                                                                <div className="mt-2 flex flex-wrap gap-1">
                                                                    {book.categories
                                                                        .slice(
                                                                            0,
                                                                            2
                                                                        )
                                                                        .map(
                                                                            (
                                                                                cat
                                                                            ) => (
                                                                                <span
                                                                                    key={
                                                                                        cat.id
                                                                                    }
                                                                                    className="rounded-full bg-white/20 px-1.5 py-0.5 text-[8px] font-medium text-white backdrop-blur-sm"
                                                                                >
                                                                                    {
                                                                                        cat.name
                                                                                    }
                                                                                </span>
                                                                            )
                                                                        )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Book title below */}
                                                    <div className="mt-3 text-center">
                                                        <p className="line-clamp-2 text-xs font-medium text-foreground">
                                                            {book.title}
                                                        </p>
                                                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                                                            {book.author
                                                                ?.split(" ")
                                                                .slice(0, 2)
                                                                .join(" ") ||
                                                                "Unknown"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pagination */}
                                {pagination.last_page > 1 && (
                                    <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handlePageChange(
                                                    pagination.current_page - 1
                                                )
                                            }
                                            disabled={
                                                pagination.current_page === 1
                                            }
                                            className="rounded-xl"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>

                                        <div className="flex gap-1 flex-wrap">
                                            {(() => {
                                                const pages = [];
                                                const current =
                                                    pagination.current_page;
                                                const last =
                                                    pagination.last_page;

                                                let startPage = Math.max(
                                                    1,
                                                    current - 2
                                                );
                                                let endPage = Math.min(
                                                    last,
                                                    current + 2
                                                );

                                                if (endPage - startPage < 4) {
                                                    if (startPage === 1) {
                                                        endPage = Math.min(
                                                            5,
                                                            last
                                                        );
                                                    } else if (
                                                        endPage === last
                                                    ) {
                                                        startPage = Math.max(
                                                            1,
                                                            last - 4
                                                        );
                                                    }
                                                }

                                                for (
                                                    let i = startPage;
                                                    i <= endPage;
                                                    i++
                                                ) {
                                                    pages.push(i);
                                                }

                                                return pages.map((pageNum) => (
                                                    <Button
                                                        key={pageNum}
                                                        variant={
                                                            pagination.current_page ===
                                                            pageNum
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        size="sm"
                                                        onClick={() =>
                                                            handlePageChange(
                                                                pageNum
                                                            )
                                                        }
                                                        className={`rounded-xl ${
                                                            pagination.current_page ===
                                                            pageNum
                                                                ? "bg-gradient-primary text-primary-foreground"
                                                                : ""
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                ));
                                            })()}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handlePageChange(
                                                    pagination.current_page + 1
                                                )
                                            }
                                            disabled={
                                                pagination.current_page ===
                                                pagination.last_page
                                            }
                                            className="rounded-xl"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                {/* Search info */}
                                {(searchTerm || selectedCategory) &&
                                    books.length > 0 && (
                                        <p className="mt-6 text-center text-sm text-muted-foreground">
                                            Menampilkan {books.length} dari{" "}
                                            {pagination.total} buku
                                            {searchTerm &&
                                                ` untuk "${searchTerm}"`}
                                            {selectedCategory &&
                                                ` di kategori ${getCategoryName(
                                                    selectedCategory
                                                )}`}
                                        </p>
                                    )}
                            </>
                        )}
                    </div>
                </div>
            </AppShell>
        </>
    );
}
