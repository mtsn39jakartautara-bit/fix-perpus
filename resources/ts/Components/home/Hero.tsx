import { Button } from "@/Components/ui/button";
import { ArrowRight } from "lucide-react";
import HeroBannerVideo from "@/assets/banner.mp4";

const Hero = () => {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Background Video */}
            <video
                src={HeroBannerVideo}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-hmi-green/30 to-transparent"></div>

            {/* Optional Hero Text (tengah layar, jika ingin ditambahkan) */}

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="w-6 h-10 border-2 border-background/50 rounded-full flex justify-center pt-2">
                    <div className="w-1.5 h-3 bg-background/50 rounded-full"></div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
