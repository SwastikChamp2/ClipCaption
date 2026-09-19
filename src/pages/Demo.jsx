
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Navbar from "../components/Navbar";
import {
    ArrowRight,
    Check,
    Play,
    Sparkles,
    Upload,
    Wand2,
    Zap,
} from "lucide-react";

/* =========================================================
   CONFIG
========================================================= */

const YOUTUBE_URL = "https://www.youtube.com/watch?v=0itGwYBOSgY";

/* =========================================================
   HELPERS
========================================================= */

function Reveal({ children, className = "", delay = 0 }) {
    const ref = useRef(null);

    const inView = useInView(ref, {
        once: true,
        margin: "-80px",
    });

    return (
        <motion.div
            ref={ref}
            className={className}
            initial={{ opacity: 0, y: 35 }}
            animate={
                inView
                    ? {
                        opacity: 1,
                        y: 0,
                    }
                    : {
                        opacity: 0,
                        y: 35,
                    }
            }
            transition={{
                duration: 0.75,
                delay,
                ease: [0.16, 1, 0.3, 1],
            }}
        >
            {children}
        </motion.div>
    );
}

function MagneticButton({ children, className = "", onClick }) {
    const [position, setPosition] = React.useState({ x: 0, y: 0 });

    return (
        <motion.button
            onClick={onClick}
            onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();

                setPosition({
                    x: (e.clientX - rect.left - rect.width / 2) * 0.12,
                    y: (e.clientY - rect.top - rect.height / 2) * 0.12,
                });
            }}
            onMouseLeave={() => setPosition({ x: 0, y: 0 })}
            animate={position}
            transition={{
                type: "spring",
                stiffness: 350,
                damping: 20,
            }}
            className={className}
        >
            {children}
        </motion.button>
    );
}

/* =========================================================
   YOUTUBE EMBED
========================================================= */

function getYoutubeEmbedUrl(url) {
    try {
        const parsedUrl = new URL(url);

        if (parsedUrl.hostname.includes("youtu.be")) {
            const videoId = parsedUrl.pathname.replace("/", "");

            return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
        }

        if (parsedUrl.hostname.includes("youtube.com")) {
            const videoId = parsedUrl.searchParams.get("v");

            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
            }

            if (parsedUrl.pathname.startsWith("/embed/")) {
                return `${url}${url.includes("?") ? "&" : "?"}rel=0&modestbranding=1`;
            }
        }

        return url;
    } catch {
        return url;
    }
}

/* =========================================================
   HERO
========================================================= */

function DemoHero() {
    return (
        <section className="relative overflow-hidden px-5 pb-20 pt-36 sm:pb-28 sm:pt-44">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />

                <div className="absolute left-1/2 top-0 h-[600px] w-[850px] -translate-x-1/2 rounded-full bg-neutral-200/50 blur-[120px]" />
            </div>

            <div className="mx-auto max-w-5xl text-center">
                <Reveal>
                    <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-black/[0.07] bg-white px-3.5 py-1.5 shadow-sm">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-30" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-black" />
                        </span>

                        <span className="text-[10px] font-medium tracking-wide text-neutral-600">
                            Product demo
                        </span>
                    </div>
                </Reveal>

                <Reveal delay={0.08}>
                    <h1 className="mx-auto max-w-4xl text-[clamp(3.4rem,8vw,7rem)] font-semibold leading-[0.91] tracking-[-0.075em] text-black">
                        See Captionflow
                        <span className="text-neutral-300"> in action.</span>
                    </h1>
                </Reveal>

                <Reveal delay={0.16}>
                    <p className="mx-auto mt-7 max-w-xl text-[15px] leading-7 tracking-[-0.01em] text-neutral-500 sm:text-[17px]">
                        See how Captionflow turns a pile of individual videos into a
                        consistent, captioned batch — without repeating the same work
                        over and over.
                    </p>
                </Reveal>

                <Reveal delay={0.23}>
                    <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-neutral-400">
                        <span className="flex items-center gap-1.5">
                            <Check size={11} />
                            Batch processing
                        </span>

                        <span className="h-1 w-1 rounded-full bg-neutral-300" />

                        <span className="flex items-center gap-1.5">
                            <Check size={11} />
                            Custom captions
                        </span>

                        <span className="h-1 w-1 rounded-full bg-neutral-300" />

                        <span className="flex items-center gap-1.5">
                            <Check size={11} />
                            One setup
                        </span>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

/* =========================================================
   VIDEO SECTION
========================================================= */

function DemoVideo() {
    const embedUrl = getYoutubeEmbedUrl(YOUTUBE_URL);

    return (
        <section className="px-5 pb-32 sm:pb-44">
            <div className="mx-auto max-w-6xl">
                <Reveal>
                    <div className="relative">
                        {/* Outer glow */}
                        <div className="absolute -inset-8 -z-10 rounded-[60px] bg-gradient-to-b from-neutral-200/70 via-white to-white blur-3xl" />

                        {/* Browser window */}
                        <div className="overflow-hidden rounded-[28px] border border-black/[0.08] bg-white shadow-[0_35px_100px_rgba(0,0,0,0.12)]">
                            {/* Browser header */}
                            <div className="flex h-12 items-center justify-between border-b border-black/[0.06] px-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                                </div>

                                <div className="hidden text-[11px] font-medium text-neutral-400 sm:block">
                                    captionflow.app / demo
                                </div>

                                <div className="w-12" />
                            </div>

                            {/* Video */}
                            <div className="bg-neutral-950 p-2 sm:p-4">
                                <div className="relative aspect-video overflow-hidden rounded-[18px] bg-black">
                                    <iframe
                                        className="absolute inset-0 h-full w-full"
                                        src={embedUrl}
                                        title="Captionflow Product Demo"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    />
                                </div>
                            </div>

                            {/* Video footer */}
                            <div className="flex flex-col gap-4 border-t border-black/[0.06] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                                <div>
                                    <div className="text-[12px] font-semibold">
                                        Captionflow product walkthrough
                                    </div>

                                    <div className="mt-1 text-[10px] text-neutral-400">
                                        See the complete workflow from upload to export.
                                    </div>
                                </div>

                                <div className="flex w-fit items-center gap-2 rounded-full bg-neutral-100 px-3 py-2 text-[9px] font-medium text-neutral-500">
                                    <Play size={10} fill="currentColor" />
                                    Watch demo
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

/* =========================================================
   WHAT YOU'LL SEE
========================================================= */

function WhatYoullSee() {
    const items = [
        {
            number: "01",
            icon: Upload,
            title: "Upload your clips",
            text: "See how multiple videos can be brought into a single project instead of being handled one at a time.",
        },
        {
            number: "02",
            icon: Wand2,
            title: "Set your caption style",
            text: "Choose how your captions look, where they appear and how long they stay visible.",
        },
        {
            number: "03",
            icon: Zap,
            title: "Apply everything at once",
            text: "Watch one caption setup get applied across the entire batch automatically.",
        },
    ];

    return (
        <section className="px-5 py-32 sm:py-44">
            <div className="mx-auto max-w-6xl">
                <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr]">
                    <Reveal>
                        <div>
                            <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                                Inside the demo
                            </div>

                            <h2 className="max-w-md text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">
                                One workflow.
                                <br />
                                No repetition.
                            </h2>

                            <p className="mt-7 max-w-sm text-sm leading-7 text-neutral-500">
                                The demo walks through the core workflow and shows how
                                Captionflow removes the repetitive parts of video
                                captioning.
                            </p>
                        </div>
                    </Reveal>

                    <div className="space-y-3">
                        {items.map((item, index) => {
                            const Icon = item.icon;

                            return (
                                <Reveal key={item.number} delay={index * 0.08}>
                                    <motion.div
                                        whileHover={{ x: 6 }}
                                        className="group flex items-start gap-5 rounded-2xl border border-black/[0.07] bg-white p-5 transition-shadow duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                                            <Icon size={15} />
                                        </div>

                                        <div className="flex-1">
                                            <div className="mb-1 flex items-center gap-3">
                                                <span className="text-[9px] font-semibold text-neutral-300">
                                                    {item.number}
                                                </span>

                                                <h3 className="text-sm font-semibold tracking-[-0.02em]">
                                                    {item.title}
                                                </h3>
                                            </div>

                                            <p className="max-w-lg text-[12px] leading-5 text-neutral-500">
                                                {item.text}
                                            </p>
                                        </div>

                                        <ArrowRight
                                            size={14}
                                            className="mt-1 text-neutral-300 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                                        />
                                    </motion.div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* =========================================================
   MID CTA
========================================================= */

function DemoCTA() {
    return (
        <section className="px-5 pb-10">
            <Reveal>
                <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-black px-7 py-20 text-center text-white sm:px-10 sm:py-28">
                    {/* Decorative circles */}
                    <motion.div
                        animate={{
                            scale: [1, 1.08, 1],
                            rotate: [0, 10, 0],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 12,
                            ease: "easeInOut",
                        }}
                        className="absolute left-1/2 top-[-220px] h-[500px] w-[500px] -translate-x-1/2 rounded-full border border-white/[0.07]"
                    />

                    <div className="absolute left-1/2 top-[-130px] h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-white/[0.035] blur-3xl" />

                    <div className="relative">
                        <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5">
                            <Sparkles size={11} className="text-white/50" />

                            <span className="text-[9px] font-medium text-white/50">
                                Ready to stop repeating yourself?
                            </span>
                        </div>

                        <h2 className="mx-auto max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-7xl">
                            Caption your next
                            <br />
                            hundred videos easier.
                        </h2>

                        <p className="mx-auto mt-7 max-w-md text-sm leading-6 text-white/40">
                            Set the rules once. Process the batch. Spend your time on
                            creating instead of repetitive editing.
                        </p>

                        <div className="mt-9">
                            <MagneticButton className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[13px] font-medium text-black transition hover:bg-neutral-200">
                                Start captioning for free

                                <ArrowRight
                                    size={14}
                                    className="transition-transform group-hover:translate-x-1"
                                />
                            </MagneticButton>
                        </div>
                    </div>
                </div>
            </Reveal>
        </section>
    );
}

/* =========================================================
   FOOTER
========================================================= */

function Footer() {
    return (
        <footer className="px-5 pb-8 pt-12">
            <div className="mx-auto flex max-w-6xl flex-col gap-8 border-t border-black/[0.07] pt-8 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-white">
                        <Sparkles size={13} />
                    </div>

                    <span className="text-sm font-semibold tracking-[-0.03em]">
                        caption<span className="text-neutral-400">flow</span>
                    </span>
                </div>

                <div className="flex flex-wrap gap-6 text-[11px] text-neutral-400">
                    <a href="#" className="transition hover:text-black">
                        Privacy
                    </a>

                    <a href="#" className="transition hover:text-black">
                        Terms
                    </a>

                    <a href="#" className="transition hover:text-black">
                        Contact
                    </a>
                </div>

                <div className="text-[10px] text-neutral-400">
                    © {new Date().getFullYear()} Captionflow
                </div>
            </div>
        </footer>
    );
}

/* =========================================================
   DEMO PAGE
========================================================= */

export default function Demo() {
    return (
        <main className="min-h-screen overflow-hidden bg-white font-sans text-black selection:bg-black selection:text-white">
            <Navbar />

            <DemoHero />

            <DemoVideo />

            <WhatYoullSee />

            <DemoCTA />

            <Footer />
        </main>
    );
}

