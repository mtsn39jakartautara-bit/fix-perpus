import { useEffect, useRef } from "react";

const Partners = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const partners = [
        {
            name: "Partner 1",
            logo: "https://via.placeholder.com/150x80?text=Partner+1",
        },
        {
            name: "Partner 2",
            logo: "https://via.placeholder.com/150x80?text=Partner+2",
        },
        {
            name: "Partner 3",
            logo: "https://via.placeholder.com/150x80?text=Partner+3",
        },
        {
            name: "Partner 4",
            logo: "https://via.placeholder.com/150x80?text=Partner+4",
        },
        {
            name: "Partner 5",
            logo: "https://via.placeholder.com/150x80?text=Partner+5",
        },
        {
            name: "Partner 6",
            logo: "https://via.placeholder.com/150x80?text=Partner+6",
        },
    ];

    const allPartners = [...partners, ...partners];

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        let scrollAmount = 0;
        const scrollStep = 1;
        const scrollInterval = 30;

        const scroll = () => {
            scrollAmount += scrollStep;
            if (scrollAmount >= scrollContainer.scrollWidth / 2) {
                scrollAmount = 0;
            }
            scrollContainer.scrollLeft = scrollAmount;
        };

        const interval = setInterval(scroll, scrollInterval);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative py-20 overflow-hidden bg-secondary/20 border-y border-border">
            {/* === SVG GRID OVERLAY === */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                preserveAspectRatio="none"
                aria-hidden
            >
                <defs>
                    <pattern
                        id="grid"
                        width="56"
                        height="56"
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d="M56 0H0V56"
                            fill="none"
                            stroke="hsl(var(--hmi-green) / 0.25)"
                            strokeWidth="1"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* === MAIN CONTENT === */}
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex justify-center">
                    <div className="inline-block mb-4 px-4 py-2 bg-primary backdrop-blur-sm border border-primary/30 rounded-full">
                        <span className="text-background font-medium text-sm">
                            Partner & kolaborator
                        </span>
                    </div>
                </div>
                <div className="text-center mb-12">
                    <h2 className="font-serif font-bold text-4xl md:text-5xl text-foreground mb-4">
                        {" "}
                        Jejak Kemitraan
                    </h2>
                    <p className="text-muted-foreground text-lg"></p>
                </div>

                <div
                    ref={scrollRef}
                    className="overflow-hidden"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    <div className="flex gap-8 md:gap-12">
                        {allPartners.map((partner, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 w-40 h-24 bg-background rounded-lg flex items-center justify-center p-4 shadow-sm hover:shadow-md transition-shadow border border-border group cursor-pointer"
                            >
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    className="max-w-full max-h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-8">
                    <p className="text-sm text-muted-foreground">
                        Tertarik bermitra dengan kami?{" "}
                        <a
                            href="/kontak"
                            className="text-primary font-medium hover:underline"
                        >
                            Hubungi Kami
                        </a>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Partners;
