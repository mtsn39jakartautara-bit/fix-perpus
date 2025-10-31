import CallToAction from "@/Components/home/CallToAction";
import Hero from "@/Components/home/Hero";
import LatestNews from "@/Components/home/LatestNews";
import Partners from "@/Components/home/Partners";
import Stats from "@/Components/home/Stats";
import Testimonials from "@/Components/home/Testimonials";
import Testing from "@/Components/home/Testing";
import AppShell from "@/Components/layouts/AppShell";
import { Link, Head } from "@inertiajs/react";
import { Footer } from "react-day-picker";
import { route } from "ziggy-js";

export default function Welcome(props: any) {
    return (
        <>
            <Head title="Welcome" />
            <AppShell>
                <div className="min-h-screen">
                    {/* <Header /> */}
                    <main>
                        <Hero />
                        <Testing />
                        {/* <Stats /> */}
                        <LatestNews />
                        <Testimonials />
                        <Partners />
                        {/* <CallToAction /> */}
                    </main>
                    <Footer />
                </div>
            </AppShell>
        </>
    );
}
