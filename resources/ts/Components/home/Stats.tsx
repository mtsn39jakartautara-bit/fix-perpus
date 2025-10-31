import { Users, Building2, GraduationCap, BookOpen } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const Stats = () => {
    const stats = [
        {
            icon: Building2,
            value: 2,
            label: "KOORDINATOR KOMISARIAT",
            suffix: "+",
            color: "from-hmi-green to-hmi-green-dark",
        },
        {
            icon: Users,
            value: 20,
            label: "KOMISARIAT",
            suffix: "+",
            color: "from-hmi-green to-hmi-green-dark",
        },
        {
            icon: GraduationCap,
            value: 500,
            label: "KADER AKTIF",
            suffix: "+",
            color: "from-hmi-green to-hmi-green-dark",
        },
        {
            icon: BookOpen,
            value: 8,
            label: "LEMBAGA PERS",
            suffix: "",
            color: "from-hmi-green to-hmi-green-dark",
        },
    ];

    return (
        <section className="pt-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} delay={index * 150} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const StatCard = ({
    icon: Icon,
    value,
    label,
    suffix,
    color,
    delay,
}: {
    icon: any;
    value: number;
    label: string;
    suffix: string;
    color: string;
    delay: number;
}) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) setIsVisible(true);
            },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        const duration = 1500;
        const steps = 60;
        const increment = value / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);
        return () => clearInterval(timer);
    }, [isVisible, value]);

    return (
        <div
            ref={ref}
            style={{ animationDelay: `${delay}ms` }}
            className={`rounded-2xl bg-gradient-to-br ${color} p-5 text-white shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between `}
        >
            <div>
                <div className="w-full flex justify-center">
                    <h3 className="text-5xl font-bold mb-1.5">
                        {count}
                        {suffix}
                    </h3>
                </div>
                <p className="text-sm text-center tracking-wide uppercase opacity-90">
                    {label}
                </p>
            </div>

            <div className="self-end mt-6 opacity-80">
                <Icon size={28} />
            </div>
        </div>
    );
};

export default Stats;
