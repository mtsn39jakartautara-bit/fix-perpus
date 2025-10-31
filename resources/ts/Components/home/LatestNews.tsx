import { Calendar, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/Components/ui/button";
import background from "@/assets/bg-background-1.jpeg";
const LatestNews = () => {
    const news = [
        {
            id: 1,
            title: "Pelantikan Pengurus HMI Cabang Depok Periode 2024-2025",
            excerpt:
                "Pelantikan pengurus baru HMI Cabang Depok dilaksanakan dengan khidmat, menandai dimulainya periode kepengurusan baru yang siap mengembangkan organisasi.",
            category: "Cabang",
            date: "2024-03-15",
            image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
        },
        {
            id: 2,
            title: "Pelatihan Kader Tingkat I Berhasil Dilaksanakan",
            excerpt:
                "Sebanyak 150 peserta mengikuti Pelatihan Kader Tingkat I yang bertujuan membentuk karakter kader HMI yang berintegritas dan berkomitmen.",
            category: "Kaderisasi",
            date: "2024-03-10",
            image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
        },
        {
            id: 3,
            title: "Bakti Sosial HMI Cabang Depok untuk Masyarakat",
            excerpt:
                "Kegiatan bakti sosial meliputi pembagian sembako, pengobatan gratis, dan santunan untuk anak yatim di wilayah Depok.",
            category: "Kegiatan",
            date: "2024-03-05",
            image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80",
        },
    ];

    return (
        <section className="pt-32 bg-background">
            <div className="container">
                {/* Header */}
                <div className="flex justify-between items-end mb-16 ml-5">
                    <div>
                        {/* Garis + teks kecil */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-[2px] h-6 bg-primary"></div>
                            <p className="uppercase tracking-[0.2em] text-sm text-muted-foreground font-semibold">
                                Kabar dan Informasi
                            </p>
                        </div>

                        {/* Judul besar */}
                        <h2 className="font-serif font-bold text-4xl md:text-5xl text-foreground leading-tight">
                            Kabar Keluarga Besar{" "}
                            <br className="hidden md:block" /> HMI Cabang Depok
                        </h2>

                        {/* Deskripsi */}
                        <p className="text-muted-foreground text-lg mt-4 max-w-2xl">
                            Aktivitas, prestasi, dan semangat juang kader HMI
                            Cabang Depok.
                        </p>
                    </div>
                </div>

                {/* News list */}
                <div className="flex flex-col lg:gap-0">
                    {news.map((item, index) => (
                        <div
                            key={item.id}
                            className={`flex flex-col lg:flex-row ${
                                index % 2 === 1 ? "lg:flex-row-reverse" : ""
                            }  lg:gap-0`}
                        >
                            {/* Image section (desktop parallax) */}
                            <div className="relative lg:w-1/2 h-[300px] lg:h-[100vh] overflow-hidden">
                                <div
                                    className="hidden lg:block sticky top-0 h-screen bg-cover bg-center bg-fixed"
                                    style={{
                                        backgroundImage: `url(${item.image})`,
                                    }}
                                />
                                {/* Untuk mobile */}
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="lg:hidden w-full h-full object-cover  "
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                                        <Tag size={12} />
                                        {item.category}
                                    </span>
                                </div>
                            </div>

                            {/* Text section */}
                            <div
                                className="lg:w-1/2 flex flex-col justify-center bg-cover bg-center bg-no-repeat px-5 py-5 lg:px-5"
                                style={{
                                    backgroundImage: `url(${background})`,
                                }}
                            >
                                <div className="flex items-center gap-2 text-sm text-primary-foreground/90 mb-3">
                                    <Calendar size={16} />
                                    <time>
                                        {new Date(item.date).toLocaleDateString(
                                            "id-ID",
                                            {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            }
                                        )}
                                    </time>
                                </div>
                                <h3 className="font-serif font-bold text-3xl text-white mb-4">
                                    {item.title}
                                </h3>
                                <p className="text-primary-foreground/90 text-lg mb-6 leading-relaxed">
                                    {item.excerpt}
                                </p>
                                <a
                                    href={`/berita/${item.id}`}
                                    className="inline-flex items-center text-hmi-green-light font-medium group border-2 border-white/10 hover:border-white/20 rounded-full px-6 py-3 w-fit"
                                >
                                    Baca Selengkapnya
                                    <ArrowRight
                                        className="ml-1 group-hover:translate-x-1 transition-transform"
                                        size={18}
                                    />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LatestNews;
