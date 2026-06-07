// resources/js/Pages/DigitalBooks/Show.tsx
import { useState } from "react";
import { AppShell } from "@/Layouts/AppShell";
import { Link, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    BookOpen,
    Heart,
    Calendar,
    User,
    Building,
    Tag,
    FileText,
    ChevronLeft,
    Award,
    TrendingUp,
    BookMarked,
    Sparkles,
} from "lucide-react";
import FlipBook from "@/Components/FlipBook";
import AddToWishlistButton from "@/Components/AddToWishlistButton";
import { Button } from "@/Components/ui/button";
import ReactionButton from "@/Components/ReactionButton";

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Book {
    id: number | string | any;
    uuid: string | any;
    title: string;
    author: string | null;
    publisher: string | null;
    publish_year: number | null;
    abstract: string | null;
    categories: Category[];
    pdf_url: string | null;
    is_wishlisted: boolean;
    wishlist_id: number | any;
    cover?: string;

    reactions_count: {
        like: number;
        love: number;
        haha: number;
        angry: number;
        sad: number;
        total: number;
    };
    user_reaction: string | null;

    user_bookmark: {
        page_number: number;
    } | null;
}

interface Props {
    book: Book;
    recommendations: Book[];
}

const fade = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

export default function DigitalBookShow({ book, recommendations }: Props) {
    const [showReader, setShowReader] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(book.is_wishlisted);
    const [reactionsCount, setReactionsCount] = useState(book.reactions_count);
    const [userReaction, setUserReaction] = useState(book.user_reaction);

    const handleWishlistSuccess = () => {
        setIsWishlisted(!isWishlisted);
    };

    // Get primary color gradient (hsl(180 92% 26%))
    const getPrimaryGradient = () => {
        return "from-[hsl(180,92%,26%)] to-[hsl(180,92%,20%)]";
    };

    if (showReader && book.pdf_url) {
        return (
            <FlipBook
                pdfUrl={book.pdf_url}
                bookTitle={book.title}
                bookId={book.id}
                onClose={() => setShowReader(false)}
                initialPage={book.user_bookmark?.page_number || 1}
                userBookmark={book.user_bookmark}
            />
        );
    }

    const handleReactionChange = (
        newReactionsCount: any,
        newUserReaction: string | null
    ) => {
        setReactionsCount(newReactionsCount);
        setUserReaction(newUserReaction);
    };

    return (
        <AppShell>
            <div className="min-h-screen bg-gradient-soft lg:bg-none">
                <div className="mx-auto max-w-6xl px-5 pt-8 pb-24 lg:px-10 lg:pt-10">
                    {/* Back Button */}
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.3 }}
                        className="mb-6"
                    >
                        <Link
                            href={route("perpus.index")}
                            className="inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2 text-sm font-medium shadow-soft transition-all hover:shadow-md"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span>Kembali ke Koleksi</span>
                        </Link>
                    </motion.div>

                    {/* Book Header */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Book Cover Section - Like a real book */}
                        <motion.div
                            {...fade}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="lg:col-span-1"
                        >
                            <div className="sticky top-24">
                                {/* Book Card - Like a real book */}
                                <div className="relative transition-all duration-300">
                                    {/* Book shadow */}
                                    <div className="absolute -bottom-4 left-4 right-4 h-6 rounded-full bg-black/20 blur-md" />

                                    {/* Book cover */}
                                    <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                                        {/* Book spine effect */}
                                        <div className="absolute left-0 top-0 h-full w-3 bg-gradient-to-r from-black/30 to-transparent z-10 rounded-l-2xl" />

                                        {/* Book content with primary color gradient */}
                                        <div
                                            className={`relative flex flex-col bg-gradient-to-br ${getPrimaryGradient()} p-6`}
                                        >
                                            {/* Cover image or placeholder */}
                                            <div className="relative aspect-[3/4] w-full">
                                                {book.cover ? (
                                                    <img
                                                        src={book.cover}
                                                        alt={book.title}
                                                        className="h-full w-full object-cover rounded-lg"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-lg bg-black/10">
                                                        <BookMarked
                                                            className="h-20 w-20 text-white/60"
                                                            strokeWidth={1}
                                                        />
                                                        <div className="text-center">
                                                            <p className="text-sm font-medium text-white/80">
                                                                E-Book
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Book mark ribbon */}
                                                <div className="absolute -right-6 -top-12 h-14 w-14 rotate-[-5deg] bg-amber-400 shadow-md" />
                                            </div>

                                            {/* Book info overlay on hover */}
                                            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 opacity-0 transition-opacity hover:opacity-100 rounded-2xl">
                                                <p className="line-clamp-3 text-sm font-medium text-white">
                                                    {book.title}
                                                </p>
                                                <p className="mt-1 text-xs text-white/80">
                                                    {book.author}
                                                </p>
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {book.categories
                                                        .slice(0, 3)
                                                        .map((cat) => (
                                                            <span
                                                                key={cat.id}
                                                                className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
                                                            >
                                                                {cat.name}
                                                            </span>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-8 flex gap-3">
                                    {book.pdf_url && (
                                        <Button
                                            onClick={() => setShowReader(true)}
                                            className="flex-1 gap-2 rounded-xl bg-gradient-primary text-primary-foreground shadow-md hover:shadow-lg"
                                        >
                                            <BookOpen className="h-4 w-4" />
                                            Baca Sekarang
                                        </Button>
                                    )}

                                    <AddToWishlistButton
                                        wishlistId={book?.wishlist_id}
                                        bookId={book.id}
                                        bookTitle={book.title}
                                        isWishlisted={isWishlisted}
                                        onSuccess={handleWishlistSuccess}
                                    />
                                </div>

                                <ReactionButton
                                    bookId={book.id}
                                    initialReactionsCount={reactionsCount}
                                    initialUserReaction={userReaction}
                                    onReactionChange={handleReactionChange}
                                />
                            </div>
                        </motion.div>

                        {/* Book Info Section */}
                        <motion.div
                            {...fade}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="lg:col-span-2"
                        >
                            <div className="rounded-3xl bg-card p-8 shadow-soft">
                                <h1 className="mb-2 text-3xl font-bold text-foreground">
                                    {book.title}
                                </h1>

                                <div className="mb-6 flex flex-wrap gap-4 border-b border-border pb-6">
                                    {book.author && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <User className="h-4 w-4" />
                                            <span>{book.author}</span>
                                        </div>
                                    )}
                                    {book.publisher && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Building className="h-4 w-4" />
                                            <span>{book.publisher}</span>
                                        </div>
                                    )}
                                    {book.publish_year && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>{book.publish_year}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Categories Section */}
                                {book.categories.length > 0 && (
                                    <div className="mb-6">
                                        <div className="mb-3 flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-primary" />
                                            <span className="text-sm font-medium text-foreground">
                                                Kategori
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {book.categories.map((category) => (
                                                <span
                                                    key={category.id}
                                                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                                >
                                                    {category.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Abstract */}
                                {book.abstract && (
                                    <div className="mb-6">
                                        <div className="mb-3 flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-primary" />
                                            <span className="text-sm font-medium text-foreground">
                                                Sinopsis
                                            </span>
                                        </div>
                                        <p className="text-justify text-base leading-relaxed text-muted-foreground">
                                            {book.abstract}
                                        </p>
                                    </div>
                                )}

                                {/* Reading Tips */}
                                <div className="mt-6 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 p-4">
                                    <div className="flex gap-3">
                                        <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                Tips Membaca
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Baca buku digital dengan nyaman
                                                menggunakan fitur flip book.
                                                Anda bisa memperbesar halaman,
                                                download PDF, dan baca
                                                fullscreen.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Recommendations Section with same book style */}
                    {recommendations.length > 0 && (
                        <motion.div
                            {...fade}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="mt-12"
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">
                                        Rekomendasi Buku Lainnya
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Buku yang mungkin Anda sukai
                                    </p>
                                </div>
                                <TrendingUp className="h-5 w-5 text-primary" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                {recommendations
                                    .slice(0, 4)
                                    .map((rec, index) => (
                                        <Link
                                            key={rec.id}
                                            href={route(
                                                "perpus.show",
                                                rec.uuid
                                            )}
                                            className="group cursor-pointer "
                                        >
                                            {/* Book Card - Like a real book */}
                                            <div className="relative transition-all duration-300 group-hover:-translate-y-2 ">
                                                {/* Book shadow */}
                                                <div className="absolute -bottom-2 left-2 right-2 h-4 rounded-full bg-black/20 opacity-0 blur-md transition-opacity group-hover:opacity-100 -z-10" />

                                                {/* Book cover */}
                                                <div className="relative overflow-hidden rounded-xl shadow-lg transition-all group-hover:shadow-xl ">
                                                    {/* Book content with primary color gradient */}
                                                    <div
                                                        className={`relative flex flex-col bg-gradient-to-br ${getPrimaryGradient()} p-3 z-10`}
                                                    >
                                                        {/* Cover image or placeholder */}
                                                        <div className="relative aspect-[3/4] w-full ">
                                                            {rec.cover ? (
                                                                <img
                                                                    src={
                                                                        rec.cover
                                                                    }
                                                                    alt={
                                                                        rec.title
                                                                    }
                                                                    className="h-full w-full object-cover rounded-lg"
                                                                    loading="lazy"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg bg-black/10">
                                                                    <BookMarked
                                                                        className="h-10 w-10 text-white/60"
                                                                        strokeWidth={
                                                                            1
                                                                        }
                                                                    />
                                                                    <div className="text-center">
                                                                        <p className="text-[10px] font-medium text-white/80">
                                                                            E-Book
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Book mark ribbon */}
                                                            <div className="absolute -right-4 -top-8 h-10 w-10 rotate-[-5deg] bg-amber-400 shadow-md" />
                                                        </div>

                                                        {/* Book info overlay on hover */}
                                                        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100 rounded-xl">
                                                            <p className="line-clamp-2 text-[10px] font-medium text-white">
                                                                {rec.title}
                                                            </p>
                                                            <p className="mt-0.5 text-[8px] text-white/80">
                                                                {rec.author}
                                                            </p>
                                                            <div className="mt-1 flex flex-wrap gap-0.5">
                                                                {rec.categories
                                                                    ?.slice(
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
                                                                                className="rounded-full bg-white/20 px-1 py-0.5 text-[6px] font-medium text-white backdrop-blur-sm"
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
                                                <div className="mt-2 text-center">
                                                    <p className="line-clamp-2 text-xs font-medium text-foreground">
                                                        {rec.title}
                                                    </p>
                                                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                                                        {rec.author
                                                            ?.split(" ")
                                                            .slice(0, 2)
                                                            .join(" ") ||
                                                            "Unknown"}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Reading Benefits */}
                    <motion.div
                        {...fade}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        className="mt-12 rounded-3xl bg-card p-6 shadow-soft"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <Award className="h-6 w-6 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">
                                Manfaat Membaca Buku Digital
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                                    <Award className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">
                                        Dapatkan Poin
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        +10 poin setiap baca buku
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">
                                        Akses 24/7
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Baca kapan saja, dimana saja
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                                    <Heart className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">
                                        Simpan Wishlist
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Koleksi buku favorit Anda
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AppShell>
    );
}
