// resources/js/Components/AddToWishlistButton.tsx
import { useState } from "react";
import { router } from "@inertiajs/react";
import { Heart, Star, Award, BookMarked, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/Components/ui/button";
import ModalPortal from "./ModalPortal";
import { toast } from "sonner";

interface Props {
    bookId: number;
    bookTitle: string;
    wishlistId?: number | any;
    isWishlisted?: boolean;
    onSuccess?: () => void;
}

export default function AddToWishlistButton({
    bookId,
    bookTitle,
    wishlistId,
    isWishlisted = false,
    onSuccess,
}: Props) {
    const [isWishlist, setIsWishlist] = useState(isWishlisted);
    const [showModal, setShowModal] = useState(false);
    const [priority, setPriority] = useState(3);
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    console.log(isWishlist);

    const getPriorityDescription = (p: number) => {
        if (p >= 4) return "Prioritas Tinggi - Segera dibaca";
        if (p === 3) return "Prioritas Sedang - Menarik untuk dibaca";
        return "Prioritas Rendah - Bacaan santai";
    };

    const getPriorityIcon = (p: number) => {
        if (p >= 4) return <Star className="h-4 w-4" />;
        if (p === 3) return <Award className="h-4 w-4" />;
        return <BookMarked className="h-4 w-4" />;
    };

    const handleAddToWishlist = () => {
        setIsLoading(true);

        router.post(
            route("wishlist.store"),
            {
                book_id: bookId,
                notes: notes,
                priority: priority,
            },
            {
                onSuccess: () => {
                    setIsWishlist(true);
                    setShowModal(false);
                    setNotes("");
                    setPriority(3);

                    toast.success("Berhasil ditambahkan ke wishlist!", {
                        description: bookTitle,
                    });

                    if (onSuccess) onSuccess();
                },
                onError: (errors: any) => {
                    console.error("Error adding to wishlist:", errors);

                    let errorMessage = "Terjadi kesalahan, silakan coba lagi.";

                    if (errors.response?.data?.message) {
                        errorMessage = errors.response.data.message;
                    } else if (errors.response?.data?.errors?.book_id) {
                        errorMessage = errors.response.data.errors.book_id[0];
                    }

                    toast.error("Gagal menambahkan ke wishlist", {
                        description: errorMessage,
                    });
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            }
        );
    };

    const handleRemoveFromWishlist = () => {
        setIsLoading(true);

        router.delete(route("wishlist.destroy", wishlistId), {
            onSuccess: () => {
                setIsWishlist(false);

                toast.success("Berhasil dihapus dari wishlist!", {
                    description: bookTitle,
                });

                if (onSuccess) onSuccess();
            },
            onError: (errors: any) => {
                console.error("Error removing from wishlist:", errors);

                let errorMessage = "Terjadi kesalahan, silakan coba lagi.";

                if (errors.response?.data?.message) {
                    errorMessage = errors.response.data.message;
                }

                toast.error("Gagal menghapus dari wishlist", {
                    description: errorMessage,
                });
            },
            onFinish: () => {
                setIsLoading(false);
                setShowDeleteModal(false);
            },
        });
    };

    return (
        <>
            <Button
                onClick={() =>
                    isWishlist ? setShowDeleteModal(true) : setShowModal(true)
                }
                disabled={isLoading}
                variant={isWishlist ? "default" : "outline"}
                className={`gap-2 rounded-xl transition-all ${
                    isWishlist
                        ? "bg-gradient-primary text-primary-foreground shadow-md hover:shadow-lg"
                        : "border-border hover:bg-primary/10 hover:text-primary"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                title={
                    isWishlist ? "Hapus dari Wishlist" : "Tambah ke Wishlist"
                }
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Heart
                        className={`h-4 w-4 ${
                            isWishlist ? "fill-current" : ""
                        }`}
                    />
                )}
                <span className="text-sm">
                    {isWishlist ? "Di Wishlist" : "Wishlist"}
                </span>
            </Button>

            {/* Modal Add to Wishlist */}
            <AnimatePresence>
                {showModal && (
                    <ModalPortal>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-md rounded-3xl bg-card p-6 shadow-xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-foreground">
                                        Tambah ke Wishlist
                                    </h3>

                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <p className="mb-4 text-sm text-muted-foreground">
                                    {bookTitle}
                                </p>

                                <div className="mb-4">
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        Prioritas
                                    </label>

                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setPriority(p)}
                                                className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-sm font-medium transition-all ${
                                                    priority === p
                                                        ? "bg-gradient-primary text-primary-foreground shadow-md"
                                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                                }`}
                                            >
                                                {getPriorityIcon(p)}
                                                {p}
                                            </button>
                                        ))}
                                    </div>

                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {getPriorityDescription(priority)}
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <label className="mb-2 block text-sm font-medium text-foreground">
                                        Catatan (Opsional)
                                    </label>

                                    <textarea
                                        value={notes}
                                        onChange={(e) =>
                                            setNotes(e.target.value)
                                        }
                                        rows={3}
                                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Tambahkan catatan tentang buku ini..."
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => setShowModal(false)}
                                        variant="outline"
                                        className="flex-1 rounded-xl"
                                        disabled={isLoading}
                                    >
                                        Batal
                                    </Button>

                                    <Button
                                        onClick={handleAddToWishlist}
                                        disabled={isLoading}
                                        className="flex-1 rounded-xl bg-gradient-primary text-primary-foreground shadow-md hover:shadow-lg disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            "Tambah ke Wishlist"
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </ModalPortal>
                )}
            </AnimatePresence>

            {/* Modal Confirm Delete */}
            <AnimatePresence>
                {showDeleteModal && (
                    <ModalPortal>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="w-full max-w-md rounded-3xl bg-card p-6 shadow-xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="mb-4 text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                                        <Heart className="h-8 w-8 text-destructive" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-foreground">
                                        Hapus dari Wishlist?
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Apakah Anda yakin ingin menghapus buku
                                        ini dari wishlist?
                                    </p>
                                    <p className="mt-3 text-sm font-medium text-foreground">
                                        "{bookTitle}"
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={() =>
                                            setShowDeleteModal(false)
                                        }
                                        variant="outline"
                                        className="flex-1 rounded-xl"
                                        disabled={isLoading}
                                    >
                                        Batal
                                    </Button>

                                    <Button
                                        onClick={handleRemoveFromWishlist}
                                        disabled={isLoading}
                                        className="flex-1 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Menghapus...
                                            </>
                                        ) : (
                                            "Ya, Hapus"
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </ModalPortal>
                )}
            </AnimatePresence>
        </>
    );
}
