// resources/js/Components/FlipBook.tsx
import React, {
    useEffect,
    useRef,
    useState,
    forwardRef,
    useCallback,
} from "react";
import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Download,
    BookOpen,
    Loader2,
    Maximize2,
    Minimize2,
    X,
} from "lucide-react";
import { Button } from "@/Components/ui/button";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface FlipBookProps {
    pdfUrl: string;
    bookTitle: string;
    onClose?: () => void;
}

interface PageData {
    pageNumber: number;
    image: string;
    width: number;
    height: number;
}

const Page = forwardRef<
    HTMLDivElement,
    {
        image?: string;
        number: number;
        isCurrent?: boolean;
    }
>(({ image, number }, ref) => {
    return (
        <div
            ref={ref}
            className="relative flex h-full w-full items-center justify-center overflow-hidden bg-card"
            style={{
                backgroundImage: `
                    radial-gradient(circle at 25% 40%, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.02) 1%, transparent 1%, transparent 100%),
                    linear-gradient(to bottom, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 100%)
                `,
                backgroundSize: "8px 8px, 100% 100%",
                boxShadow: "inset 0 0 30px rgba(0,0,0,0.05)",
            }}
        >
            {image ? (
                <>
                    <img
                        src={image}
                        alt={`Halaman ${number}`}
                        className="h-full w-full object-contain"
                        loading="lazy"
                    />
                    <div className="absolute bottom-3 right-3 rounded-full bg-background/80 px-2 py-1 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
                        {number}
                    </div>
                    <div className="absolute left-0 top-0 h-8 w-8 rounded-tl-lg border-l-2 border-t-2 border-border" />
                    <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-border" />
                </>
            ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                        Memuat halaman...
                    </span>
                </div>
            )}
        </div>
    );
});

Page.displayName = "Page";

export default function FlipBook({
    pdfUrl,
    bookTitle,
    onClose,
}: FlipBookProps) {
    const [loading, setLoading] = useState(true);
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(
        null
    );
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pages, setPages] = useState<Map<number, PageData>>(new Map());
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [scale, setScale] = useState(1.5);
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== "undefined" ? window.innerWidth : 1200,
        height: typeof window !== "undefined" ? window.innerHeight : 800,
    });
    const flipBookRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const PAGE_WINDOW = 8;

    // Track window size for responsive adjustments
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Load PDF
    useEffect(() => {
        const loadPdf = async () => {
            try {
                setLoading(true);
                const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
                setPdfDoc(pdf);
                setTotalPages(pdf.numPages);
            } catch (error) {
                console.error("Error loading PDF:", error);
            } finally {
                setLoading(false);
            }
        };

        loadPdf();
    }, [pdfUrl]);

    const renderPage = useCallback(
        async (pageNumber: number) => {
            if (!pdfDoc) return;

            setPages((prev) => {
                if (prev.has(pageNumber)) return prev;
                return prev;
            });

            try {
                const page = await pdfDoc.getPage(pageNumber);

                // Responsive scale based on screen size
                let calculatedScale = scale;
                if (windowSize.width < 640) {
                    // mobile
                    calculatedScale = scale * 1.2;
                } else if (windowSize.width < 768) {
                    // tablet small
                    calculatedScale = scale * 1.1;
                } else if (windowSize.width < 1024) {
                    // tablet
                    calculatedScale = scale;
                } else {
                    // desktop
                    calculatedScale = scale * 0.9;
                }

                const viewport = page.getViewport({ scale: calculatedScale });
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");

                if (!context) return;

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({
                    canvas,
                    canvasContext: context,
                    viewport,
                }).promise;

                const image = canvas.toDataURL("image/jpeg", 0.85);

                setPages((prev) => {
                    if (prev.has(pageNumber)) return prev;
                    const updated = new Map(prev);
                    updated.set(pageNumber, {
                        pageNumber,
                        image,
                        width: viewport.width,
                        height: viewport.height,
                    });
                    return updated;
                });
            } catch (error) {
                console.error("Render page error:", error);
            }
        },
        [pdfDoc, scale, windowSize.width]
    );

    // Lazy load nearby pages
    useEffect(() => {
        if (!pdfDoc) return;

        const start = Math.max(1, currentPage - PAGE_WINDOW);
        const end = Math.min(totalPages, currentPage + PAGE_WINDOW);

        for (let i = start; i <= end; i++) {
            renderPage(i);
        }

        setPages((prev) => {
            const updated = new Map(prev);
            updated.forEach((_, key) => {
                if (key < start - 5 || key > end + 5) {
                    updated.delete(key);
                }
            });
            return updated;
        });
    }, [currentPage, pdfDoc, renderPage, totalPages]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () =>
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
    }, []);

    // Handle zoom - Re-render pages when scale changes
    useEffect(() => {
        if (pdfDoc && !loading) {
            setPages(new Map());
            const start = Math.max(1, currentPage - PAGE_WINDOW);
            const end = Math.min(totalPages, currentPage + PAGE_WINDOW);
            for (let i = start; i <= end; i++) {
                renderPage(i);
            }
        }
    }, [scale]);

    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.2, 2.5));
    };

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.2, 1.0));
    };

    const goToPrevPage = () => {
        if (flipBookRef.current && currentPage > 1) {
            flipBookRef.current.pageFlip().flipPrev();
        }
    };

    const goToNextPage = () => {
        if (flipBookRef.current && currentPage < totalPages) {
            flipBookRef.current.pageFlip().flipNext();
        }
    };

    const downloadPDF = () => {
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = `${bookTitle}.pdf`;
        link.click();
    };

    // Get responsive book dimensions based on screen size
    const getBookDimensions = () => {
        const width = windowSize.width;

        if (isFullscreen) {
            return {
                width: Math.min(width * 0.9, 1200),
                height: Math.min(windowSize.height * 0.85, 1000),
            };
        }

        if (width < 640) {
            // mobile
            return { width: width * 0.85, height: width * 0.85 * 1.4 };
        } else if (width < 768) {
            // tablet small
            return { width: 500, height: 700 };
        } else if (width < 1024) {
            // tablet
            return { width: 600, height: 850 };
        } else if (width < 1280) {
            // laptop
            return { width: 700, height: 950 };
        } else {
            // desktop
            return { width: 800, height: 1100 };
        }
    };

    const dimensions = getBookDimensions();
    const isMobile = windowSize.width < 768;

    console.log(pdfUrl);

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-muted/20 via-background to-muted/20">
                <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-muted border-t-primary" />
                    <BookOpen className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-primary" />
                </div>
                <div className="text-center">
                    <p className="font-medium text-foreground">
                        Memuat Buku Digital
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Mohon tunggu sebentar...
                    </p>
                </div>
            </div>
        );
    }

    const bookPages = [];
    for (let i = 1; i <= totalPages; i++) {
        const page = pages.get(i);
        bookPages.push(
            <Page
                key={i}
                number={i}
                {...(page?.image && { image: page.image })}
            />
        );
    }

    return (
        <div
            ref={containerRef}
            className="h-full min-h-screen w-full overflow-auto bg-gradient-to-br from-muted/20 via-background to-muted/20"
        >
            {/* Toolbar */}
            <div className="sticky top-0 z-20 border-b border-border bg-background/95 shadow-sm backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={onClose}
                                variant="ghost"
                                size="sm"
                                className="rounded-xl"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <div className="min-w-0 flex-1">
                                <h2 className="truncate font-semibold text-foreground max-w-[200px] sm:max-w-md">
                                    {bookTitle}
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    {totalPages} halaman
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleZoomOut}
                                variant="ghost"
                                size="sm"
                                className="rounded-xl"
                                title="Perkecil"
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <span className="min-w-[60px] text-center text-xs text-muted-foreground">
                                {Math.round(scale * 100)}%
                            </span>
                            <Button
                                onClick={handleZoomIn}
                                variant="ghost"
                                size="sm"
                                className="rounded-xl"
                                title="Perbesar"
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>

                            <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

                            <Button
                                onClick={downloadPDF}
                                variant="ghost"
                                size="sm"
                                className="rounded-xl"
                                title="Download PDF"
                            >
                                <Download className="h-4 w-4" />
                            </Button>

                            <Button
                                onClick={toggleFullscreen}
                                variant="ghost"
                                size="sm"
                                className="rounded-xl"
                                title={
                                    isFullscreen
                                        ? "Keluar Fullscreen"
                                        : "Fullscreen"
                                }
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="h-4 w-4" />
                                ) : (
                                    <Maximize2 className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* FlipBook Container - Responsive */}
            <div className="flex min-h-[calc(100vh-70px)] items-center justify-center px-2 py-4 sm:px-4 sm:py-8">
                <div className="relative">
                    {/* Shadow effect */}
                    <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-muted/20 via-muted/10 to-muted/20 blur-xl sm:-inset-4 sm:rounded-3xl" />

                    <div className="relative">
                        <HTMLFlipBook
                            ref={flipBookRef}
                            width={dimensions.width}
                            height={dimensions.height}
                            size="stretch"
                            minWidth={300}
                            maxWidth={isFullscreen ? 1400 : 1000}
                            minHeight={400}
                            maxHeight={isFullscreen ? 1000 : 1200}
                            maxShadowOpacity={0.4}
                            showCover={true}
                            mobileScrollSupport={true}
                            drawShadow={true}
                            flippingTime={600}
                            usePortrait={isMobile}
                            startZIndex={0}
                            autoSize={true}
                            clickEventForward={true}
                            useMouseEvents={true}
                            swipeDistance={30}
                            showPageCorners={true}
                            disableFlipByClick={false}
                            onFlip={(e) => {
                                setCurrentPage(e.data + 1);
                            }}
                            className="flip-book-custom mx-auto overflow-hidden rounded-lg shadow-2xl"
                            style={{}}
                            startPage={currentPage - 1}
                        >
                            {bookPages}
                        </HTMLFlipBook>
                    </div>
                </div>
            </div>

            {/* Navigation Controls - Responsive */}
            <div className="fixed bottom-4 left-1/2 z-20 -translate-x-1/2">
                <div className="flex items-center gap-2 rounded-full bg-foreground/70 px-3 py-2 shadow-lg backdrop-blur-md sm:gap-4 sm:px-5 sm:py-3">
                    <button
                        onClick={goToPrevPage}
                        disabled={currentPage <= 1}
                        className="rounded-full p-1 transition-colors hover:bg-foreground/20 disabled:cursor-not-allowed disabled:opacity-30 sm:p-2"
                    >
                        <ChevronLeft className="h-5 w-5 text-background sm:h-6 sm:w-6" />
                    </button>

                    <div className="min-w-[80px] text-center text-xs font-medium text-background sm:min-w-[120px] sm:text-base">
                        {currentPage} / {totalPages}
                    </div>

                    <button
                        onClick={goToNextPage}
                        disabled={currentPage >= totalPages}
                        className="rounded-full p-1 transition-colors hover:bg-foreground/20 disabled:cursor-not-allowed disabled:opacity-30 sm:p-2"
                    >
                        <ChevronRight className="h-5 w-5 text-background sm:h-6 sm:w-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}
