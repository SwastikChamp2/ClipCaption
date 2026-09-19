import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Navbar from "../components/Navbar";
import {
    ArrowRight,
    Check,
    ChevronDown,
    ChevronRight,
    CloudUpload,
    Film,
    Layers3,
    MousePointer2,
    Play,
    Sparkles,
    Wand2,
    Zap,
    Upload,
    X,
    Plus,
    Minus,
    Menu,
    MoveUpRight,
} from "lucide-react";

/* =========================================================
   SMALL HELPERS
========================================================= */

const fadeUp = {
    hidden: { opacity: 0, y: 35 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
        },
    },
};

const stagger = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.09,
        },
    },
};

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
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={{
                hidden: { opacity: 0, y: 35 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                        duration: 0.75,
                        delay,
                        ease: [0.16, 1, 0.3, 1],
                    },
                },
            }}
        >
            {children}
        </motion.div>
    );
}

function MagneticButton({ children, className = "", onClick }) {
    const [position, setPosition] = useState({ x: 0, y: 0 });

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
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
            className={className}
        >
            {children}
        </motion.button>
    );
}



/* =========================================================
   HERO PRODUCT DEMO
========================================================= */

function ProductDemo() {
    const [activeDuration, setActiveDuration] = useState("100%");
    const [position, setPosition] = useState("Bottom");
    const [font, setFont] = useState("Inter");
    const [uploaded, setUploaded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 1,
                delay: 0.35,
                ease: [0.16, 1, 0.3, 1],
            }}
            className="relative mx-auto mt-16 max-w-6xl"
        >
            {/* Glow */}
            <div className="absolute -inset-10 -z-10 rounded-[60px] bg-gradient-to-b from-neutral-200/70 via-white to-white blur-3xl" />

            <div className="overflow-hidden rounded-[26px] border border-black/[0.08] bg-white shadow-[0_35px_100px_rgba(0,0,0,0.12)]">
                {/* Window header */}
                <div className="flex h-12 items-center justify-between border-b border-black/[0.06] px-4">
                    <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                        <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                        <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                    </div>

                    <div className="hidden text-[11px] font-medium text-neutral-400 sm:block">
                        captionflow.app / workspace
                    </div>

                    <div className="w-12" />
                </div>

                <div className="grid min-h-[570px] grid-cols-1 lg:grid-cols-[220px_1fr]">
                    {/* Sidebar */}
                    <div className="hidden border-r border-black/[0.06] bg-neutral-50/50 p-4 lg:block">
                        <div className="mb-8">
                            <div className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                                Workspace
                            </div>

                            <div className="flex items-center gap-2 rounded-xl bg-black px-3 py-2.5 text-[11px] font-medium text-white">
                                <Layers3 size={13} />
                                New project
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                                Projects
                            </div>

                            {["Product launch", "UGC batch", "September clips"].map(
                                (item, index) => (
                                    <div
                                        key={item}
                                        className={`mb-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-[11px] ${index === 0
                                            ? "bg-black/[0.05] font-medium text-black"
                                            : "text-neutral-500"
                                            }`}
                                    >
                                        <Film size={12} />
                                        {item}
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Main */}
                    <div className="bg-white">
                        <div className="border-b border-black/[0.06] px-5 py-4 sm:px-7">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-[12px] font-semibold">Product launch</div>
                                    <div className="mt-0.5 text-[10px] text-neutral-400">
                                        24 clips · Edited just now
                                    </div>
                                </div>

                                <button className="flex items-center gap-1.5 rounded-full border border-black/[0.08] px-3 py-2 text-[10px] font-medium">
                                    <Plus size={11} />
                                    Add clips
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 p-5 sm:p-7 lg:grid-cols-[1fr_240px]">
                            {/* Upload / Preview */}
                            <div>
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="text-[11px] font-medium text-neutral-500">
                                        Your clips
                                    </div>

                                    <div className="text-[10px] text-neutral-400">
                                        {uploaded ? "24 clips selected" : "0 clips selected"}
                                    </div>
                                </div>

                                <div
                                    onClick={() => setUploaded(true)}
                                    className="group relative flex min-h-[270px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-black/10 bg-neutral-50 transition hover:border-black/20 hover:bg-neutral-[0.04]"
                                >
                                    {/* fake video frame */}
                                    <div className="absolute inset-4 overflow-hidden rounded-xl bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-950">
                                        <div className="absolute inset-0 opacity-30">
                                            <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-white blur-[80px]" />
                                            <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-neutral-300 blur-[90px]" />
                                        </div>

                                        <div className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                                            <Play
                                                size={15}
                                                fill="white"
                                                className="absolute left-1/2 top-1/2 -translate-x-[42%] -translate-y-1/2 text-white"
                                            />
                                        </div>

                                        <motion.div
                                            animate={{
                                                y: [0, -2, 0],
                                                opacity: [0.9, 1, 0.9],
                                            }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 3,
                                            }}
                                            className="absolute bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-3 py-1.5 text-[10px] font-semibold text-black shadow-xl"
                                        >
                                            Create better. Faster.
                                        </motion.div>

                                        {!uploaded && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                                                <div className="text-center text-white">
                                                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                                                        <CloudUpload size={17} />
                                                    </div>
                                                    <div className="text-[11px] font-medium">
                                                        Drop your clips here
                                                    </div>
                                                    <div className="mt-1 text-[9px] text-white/50">
                                                        or click to browse
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {uploaded && (
                                        <div className="absolute bottom-7 left-7 rounded-full bg-black/70 px-3 py-1.5 text-[9px] font-medium text-white backdrop-blur">
                                            24 clips ready
                                        </div>
                                    )}
                                </div>

                                {/* Timeline */}
                                <div className="mt-4 rounded-xl border border-black/[0.06] p-3">
                                    <div className="mb-2 flex justify-between text-[8px] text-neutral-400">
                                        <span>00:00</span>
                                        <span>00:18</span>
                                    </div>

                                    <div className="relative h-10 overflow-hidden rounded-lg bg-neutral-100">
                                        <div className="flex h-full gap-1 p-1">
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                                                <div
                                                    key={item}
                                                    className="h-full flex-1 rounded bg-neutral-300/70"
                                                />
                                            ))}
                                        </div>

                                        <motion.div
                                            animate={{ left: ["0%", "100%"] }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: "linear",
                                            }}
                                            className="absolute top-0 h-full w-px bg-black"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Settings */}
                            <div className="rounded-2xl border border-black/[0.06] bg-neutral-50/60 p-4">
                                <div className="mb-5 text-[11px] font-semibold">
                                    Caption settings
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="mb-2 block text-[9px] font-medium text-neutral-400">
                                            Position
                                        </label>

                                        <div className="grid grid-cols-3 gap-1 rounded-xl bg-neutral-100 p-1">
                                            {["Top", "Center", "Bottom"].map((item) => (
                                                <button
                                                    key={item}
                                                    onClick={() => setPosition(item)}
                                                    className={`rounded-lg py-2 text-[9px] transition ${position === item
                                                        ? "bg-white font-medium shadow-sm"
                                                        : "text-neutral-400"
                                                        }`}
                                                >
                                                    {item}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-[9px] font-medium text-neutral-400">
                                            Duration
                                        </label>

                                        <div className="space-y-1">
                                            {["First 25%", "Last 25%", "100%"].map((item) => (
                                                <button
                                                    key={item}
                                                    onClick={() =>
                                                        setActiveDuration(item.replace("First ", "").replace("Last ", ""))
                                                    }
                                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-[9px] ${activeDuration ===
                                                        item.replace("First ", "").replace("Last ", "")
                                                        ? "bg-black text-white"
                                                        : "text-neutral-500 hover:bg-neutral-100"
                                                        }`}
                                                >
                                                    {item}
                                                    {activeDuration ===
                                                        item.replace("First ", "").replace("Last ", "") && (
                                                            <Check size={10} />
                                                        )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-[9px] font-medium text-neutral-400">
                                            Font
                                        </label>

                                        <select
                                            value={font}
                                            onChange={(e) => setFont(e.target.value)}
                                            className="w-full rounded-lg border border-black/[0.06] bg-white px-3 py-2 text-[9px] outline-none"
                                        >
                                            <option>Inter</option>
                                            <option>Helvetica</option>
                                            <option>Montserrat</option>
                                            <option>DM Sans</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-[9px] font-medium text-neutral-400">
                                            Animation
                                        </label>

                                        <div className="flex items-center justify-between rounded-lg border border-black/[0.06] bg-white px-3 py-2.5">
                                            <span className="text-[9px]">Fade up</span>
                                            <ChevronDown size={11} className="text-neutral-400" />
                                        </div>
                                    </div>

                                    <button className="group flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-[10px] font-medium text-white transition hover:bg-neutral-800">
                                        Apply to 24 clips
                                        <ArrowRight
                                            size={11}
                                            className="transition-transform group-hover:translate-x-0.5"
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/* =========================================================
   HERO
========================================================= */

function Hero() {
    return (
        <section className="relative overflow-hidden px-5 pb-24 pt-36 sm:pt-44">
            {/* Background grid */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />

                <div className="absolute left-1/2 top-0 h-[650px] w-[850px] -translate-x-1/2 rounded-full bg-neutral-200/50 blur-[120px]" />
            </div>

            <div className="mx-auto max-w-5xl text-center">
                <Reveal>
                    <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-black/[0.07] bg-white px-3.5 py-1.5 shadow-sm">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-30" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-black" />
                        </span>

                        <span className="text-[10px] font-medium tracking-wide text-neutral-600">
                            Bulk video captioning, finally made simple.
                        </span>
                    </div>
                </Reveal>

                <Reveal delay={0.08}>
                    <h1 className="mx-auto max-w-4xl text-[clamp(3.4rem,8vw,7rem)] font-semibold leading-[0.91] tracking-[-0.075em] text-black">
                        Caption
                        <span className="text-neutral-300"> hundreds </span>
                        of videos in minutes.
                    </h1>
                </Reveal>

                <Reveal delay={0.16}>
                    <p className="mx-auto mt-7 max-w-xl text-[15px] leading-7 tracking-[-0.01em] text-neutral-500 sm:text-[17px]">
                        Upload your clips once. Choose how your captions look and when
                        they appear. We do the repetitive work for every video.
                    </p>
                </Reveal>

                <Reveal delay={0.23}>
                    <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <MagneticButton className="group flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-3.5 text-[13px] font-medium text-white shadow-xl shadow-black/10 transition hover:bg-neutral-800 sm:w-auto">
                            Start captioning for free
                            <ArrowRight
                                size={14}
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </MagneticButton>

                        <button className="group flex items-center gap-2 rounded-full px-5 py-3.5 text-[13px] font-medium text-neutral-500 transition hover:text-black">
                            <Play size={13} fill="currentColor" />
                            See how it works
                        </button>
                    </div>
                </Reveal>

                <Reveal delay={0.3}>
                    <div className="mt-5 flex items-center justify-center gap-4 text-[10px] text-neutral-400">
                        <span className="flex items-center gap-1.5">
                            <Check size={11} />
                            No credit card
                        </span>
                        <span className="h-1 w-1 rounded-full bg-neutral-300" />
                        <span className="flex items-center gap-1.5">
                            <Check size={11} />
                            Batch processing
                        </span>
                    </div>
                </Reveal>
            </div>

            <ProductDemo />
        </section>
    );
}

/* =========================================================
   LOGO / SOCIAL PROOF STRIP
========================================================= */

function TrustStrip() {
    return (
        <section className="border-y border-black/[0.06] bg-neutral-50/50 px-5 py-8">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 md:flex-row md:justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                    Built for people who publish
                </span>

                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[13px] font-semibold tracking-[-0.03em] text-neutral-400">
                    <span>MARKETERS</span>
                    <span>CREATORS</span>
                    <span>AGENCIES</span>
                    <span>SOCIAL TEAMS</span>
                    <span>MEDIA</span>
                </div>
            </div>
        </section>
    );
}

/* =========================================================
   PROBLEM SECTION
========================================================= */

function ProblemSection() {
    return (
        <section className="px-5 py-32 sm:py-44">
            <div className="mx-auto max-w-6xl">
                <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                    <Reveal>
                        <div>
                            <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                                The boring part
                            </div>

                            <h2 className="max-w-lg text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">
                                Your content team shouldn't spend Friday doing this.
                            </h2>
                        </div>
                    </Reveal>

                    <Reveal delay={0.1}>
                        <p className="max-w-xl text-lg leading-8 text-neutral-500">
                            One video is easy. Ten is manageable. Fifty becomes a task no
                            one wants to own. Upload. Add text. Position it. Set the timing.
                            Animate it. Export. Repeat.
                        </p>
                    </Reveal>
                </div>

                <div className="mt-20 grid gap-4 md:grid-cols-3">
                    {[
                        {
                            number: "01",
                            title: "Open the editor",
                            text: "Every clip needs to be opened and edited individually.",
                        },
                        {
                            number: "02",
                            title: "Repeat the same settings",
                            text: "Same font. Same position. Same animation. Again and again.",
                        },
                        {
                            number: "03",
                            title: "Export everything",
                            text: "Dozens of nearly identical actions before the content is ready.",
                        },
                    ].map((item, index) => (
                        <Reveal key={item.number} delay={index * 0.08}>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="group h-full rounded-3xl border border-black/[0.07] bg-white p-7 transition-shadow duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.07)]"
                            >
                                <div className="mb-14 flex items-center justify-between">
                                    <span className="text-[11px] font-semibold text-neutral-300">
                                        {item.number}
                                    </span>

                                    <ArrowRight
                                        size={15}
                                        className="text-neutral-300 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                                    />
                                </div>

                                <h3 className="text-lg font-semibold tracking-[-0.03em]">
                                    {item.title}
                                </h3>

                                <p className="mt-3 text-sm leading-6 text-neutral-500">
                                    {item.text}
                                </p>
                            </motion.div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* =========================================================
   HOW IT WORKS
========================================================= */

function HowItWorks() {
    return (
        <section id="how" className="overflow-hidden bg-black px-5 py-32 text-white sm:py-44">
            <div className="mx-auto max-w-6xl">
                <div className="grid gap-14 lg:grid-cols-[0.65fr_1fr]">
                    <Reveal>
                        <div>
                            <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
                                How it works
                            </div>

                            <h2 className="max-w-md text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">
                                One setup.
                                <br />
                                Every clip.
                            </h2>

                            <p className="mt-7 max-w-sm text-sm leading-7 text-white/45">
                                Define the rules once and let Captionflow apply them across
                                your entire batch.
                            </p>
                        </div>
                    </Reveal>

                    <div className="space-y-3">
                        {[
                            {
                                number: "01",
                                icon: Upload,
                                title: "Upload your clips",
                                text: "Drop dozens of videos into one project. No need to edit them one by one.",
                            },
                            {
                                number: "02",
                                icon: Wand2,
                                title: "Define your caption style",
                                text: "Choose position, duration, font, animation and other visual settings.",
                            },
                            {
                                number: "03",
                                icon: Zap,
                                title: "Apply to everything",
                                text: "Captionflow automatically applies your settings to every clip in the batch.",
                            },
                            {
                                number: "04",
                                icon: ArrowRight,
                                title: "Export",
                                text: "Download your finished clips and get back to creating.",
                            },
                        ].map((item, index) => {
                            const Icon = item.icon;

                            return (
                                <Reveal key={item.number} delay={index * 0.07}>
                                    <motion.div
                                        whileHover={{ x: 6 }}
                                        className="group flex items-start gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 transition-colors hover:bg-white/[0.06]"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                                            <Icon size={15} className="text-white/70" />
                                        </div>

                                        <div className="flex-1">
                                            <div className="mb-1 flex items-center gap-3">
                                                <span className="text-[9px] font-semibold text-white/20">
                                                    {item.number}
                                                </span>

                                                <h3 className="text-sm font-medium">
                                                    {item.title}
                                                </h3>
                                            </div>

                                            <p className="max-w-md text-[12px] leading-5 text-white/40">
                                                {item.text}
                                            </p>
                                        </div>

                                        <ChevronRight
                                            size={15}
                                            className="mt-1 text-white/20 transition-transform group-hover:translate-x-1"
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
   FEATURES
========================================================= */

function Features() {
    const features = [
        {
            large: true,
            icon: Layers3,
            eyebrow: "Batch everything",
            title: "One caption system. An entire content library.",
            text: "Stop treating every clip like a separate project. Set your rules once and process your entire batch with the same visual language.",
            visual: "batch",
        },
        {
            icon: MousePointer2,
            eyebrow: "Precise placement",
            title: "Tell us when and where.",
            text: "Top, center or bottom. First quarter, last quarter or the entire clip.",
            visual: "position",
        },
        {
            icon: Sparkles,
            eyebrow: "Motion included",
            title: "Make the text move.",
            text: "Give your captions a polished entrance without manually keyframing every clip.",
            visual: "motion",
        },
    ];

    return (
        <section id="features" className="px-5 py-32 sm:py-44">
            <div className="mx-auto max-w-6xl">
                <Reveal>
                    <div className="max-w-2xl">
                        <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                            Built around your workflow
                        </div>

                        <h2 className="text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">
                            Less editing.
                            <br />
                            More publishing.
                        </h2>
                    </div>
                </Reveal>

                <div className="mt-16 grid gap-4 md:grid-cols-2">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <Reveal
                                key={feature.title}
                                delay={index * 0.08}
                                className={feature.large ? "md:col-span-2" : ""}
                            >
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className={`group relative overflow-hidden rounded-[30px] border border-black/[0.07] bg-neutral-50 ${feature.large
                                        ? "min-h-[420px] p-8 sm:p-12"
                                        : "min-h-[390px] p-8"
                                        }`}
                                >
                                    <div className="relative z-10 max-w-md">
                                        <div className="mb-7 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                                            <Icon size={16} />
                                        </div>

                                        <div className="mb-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                                            {feature.eyebrow}
                                        </div>

                                        <h3
                                            className={`font-semibold tracking-[-0.045em] ${feature.large
                                                ? "text-3xl sm:text-4xl"
                                                : "text-2xl"
                                                }`}
                                        >
                                            {feature.title}
                                        </h3>

                                        <p className="mt-4 max-w-sm text-sm leading-6 text-neutral-500">
                                            {feature.text}
                                        </p>
                                    </div>

                                    {/* Batch visual */}
                                    {feature.visual === "batch" && (
                                        <div className="absolute bottom-[-70px] right-[-30px] hidden w-[62%] rotate-[-3deg] sm:block">
                                            <div className="rounded-[22px] border border-black/[0.08] bg-white p-3 shadow-2xl">
                                                <div className="grid grid-cols-4 gap-2">
                                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            whileInView={{ opacity: 1, y: 0 }}
                                                            transition={{
                                                                delay: i * 0.05,
                                                                duration: 0.4,
                                                            }}
                                                            className="relative aspect-[9/13] overflow-hidden rounded-lg bg-neutral-900"
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-br from-neutral-600 via-neutral-800 to-black" />
                                                            <div className="absolute bottom-3 left-1/2 w-[80%] -translate-x-1/2 rounded bg-white px-1 py-1 text-center text-[5px] font-bold text-black">
                                                                Your caption
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Position visual */}
                                    {feature.visual === "position" && (
                                        <div className="absolute bottom-7 right-7 hidden w-44 overflow-hidden rounded-2xl border border-black/[0.07] bg-white p-2 shadow-xl sm:block">
                                            <div className="relative aspect-[9/14] overflow-hidden rounded-xl bg-neutral-800">
                                                <div className="absolute inset-0 bg-gradient-to-br from-neutral-600 to-neutral-950" />

                                                <div className="absolute inset-x-4 top-5 border-t border-dashed border-white/20" />
                                                <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-white/20" />
                                                <div className="absolute inset-x-4 bottom-5 border-t border-dashed border-white/20" />

                                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded bg-white px-2 py-1 text-[6px] font-bold text-black">
                                                    Perfectly placed
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Motion visual */}
                                    {feature.visual === "motion" && (
                                        <div className="absolute bottom-8 right-8 hidden w-56 sm:block">
                                            <div className="relative h-32 overflow-hidden rounded-2xl border border-black/[0.07] bg-neutral-900 shadow-xl">
                                                {[0, 1, 2].map((i) => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{
                                                            x: [20, 0, 20],
                                                            opacity: [0.3, 1, 0.3],
                                                        }}
                                                        transition={{
                                                            repeat: Infinity,
                                                            duration: 2.2,
                                                            delay: i * 0.25,
                                                        }}
                                                        className="absolute left-1/2 -translate-x-1/2 rounded bg-white px-3 py-1.5 text-[7px] font-bold text-black"
                                                        style={{
                                                            top: `${28 + i * 25}px`,
                                                        }}
                                                    >
                                                        Your caption
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/* =========================================================
   WORKFLOW / INTERACTIVE
========================================================= */

function Workflow() {
    const [active, setActive] = useState(0);

    const steps = [
        {
            title: "Upload",
            description: "Bring in all the clips you want to caption.",
        },
        {
            title: "Style",
            description: "Choose your font, position, animation and timing.",
        },
        {
            title: "Process",
            description: "Apply those rules across every clip automatically.",
        },
        {
            title: "Export",
            description: "Get your finished batch ready to publish.",
        },
    ];

    return (
        <section id="workflow" className="bg-neutral-50 px-5 py-32 sm:py-44">
            <div className="mx-auto max-w-6xl">
                <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                    <Reveal>
                        <div>
                            <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                                The workflow
                            </div>

                            <h2 className="text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">
                                Your new
                                <br />
                                repetitive-task killer.
                            </h2>

                            <div className="mt-10 space-y-1">
                                {steps.map((step, index) => (
                                    <button
                                        key={step.title}
                                        onClick={() => setActive(index)}
                                        className={`flex w-full items-center gap-4 rounded-2xl p-4 text-left transition ${active === index
                                            ? "bg-white shadow-sm"
                                            : "hover:bg-white/60"
                                            }`}
                                    >
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-semibold ${active === index
                                                ? "bg-black text-white"
                                                : "bg-neutral-200 text-neutral-500"
                                                }`}
                                        >
                                            0{index + 1}
                                        </div>

                                        <div>
                                            <div className="text-sm font-semibold">
                                                {step.title}
                                            </div>
                                            {active === index && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    className="mt-1 text-[11px] leading-5 text-neutral-400"
                                                >
                                                    {step.description}
                                                </motion.div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Reveal>

                    <Reveal delay={0.1}>
                        <div className="relative aspect-square max-w-[600px] overflow-hidden rounded-[32px] border border-black/[0.07] bg-white p-5 shadow-[0_30px_80px_rgba(0,0,0,0.07)] sm:p-8">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,0,0,0.06),transparent_45%)]" />

                            <div className="relative flex h-full flex-col">
                                <div className="flex items-center justify-between">
                                    <div className="text-[11px] font-semibold">
                                        {steps[active].title}
                                    </div>

                                    <div className="rounded-full bg-neutral-100 px-3 py-1 text-[9px] text-neutral-400">
                                        Step {active + 1} / 4
                                    </div>
                                </div>

                                <div className="flex flex-1 items-center justify-center">
                                    <motion.div
                                        key={active}
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{
                                            duration: 0.6,
                                            ease: [0.16, 1, 0.3, 1],
                                        }}
                                        className="relative w-[70%] max-w-[300px]"
                                    >
                                        {active === 0 && (
                                            <div className="rounded-3xl border border-dashed border-black/10 bg-neutral-50 p-10 text-center">
                                                <CloudUpload
                                                    size={28}
                                                    className="mx-auto mb-4 text-neutral-400"
                                                />
                                                <div className="text-sm font-semibold">
                                                    Drop your videos
                                                </div>
                                                <div className="mt-2 text-[10px] text-neutral-400">
                                                    24 clips · 312 MB
                                                </div>
                                            </div>
                                        )}

                                        {active === 1 && (
                                            <div className="rounded-3xl border border-black/[0.07] bg-neutral-50 p-5">
                                                <div className="mb-4 aspect-[9/12] overflow-hidden rounded-2xl bg-neutral-800">
                                                    <div className="relative flex h-full items-center justify-center bg-gradient-to-br from-neutral-600 to-neutral-950">
                                                        <div className="rounded bg-white px-3 py-2 text-[10px] font-bold">
                                                            Your caption
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="h-2 rounded-full bg-neutral-200" />
                                                    <div className="h-2 w-2/3 rounded-full bg-neutral-200" />
                                                </div>
                                            </div>
                                        )}

                                        {active === 2 && (
                                            <div className="relative">
                                                <div className="grid grid-cols-3 gap-2">
                                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, scale: 0.7 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{
                                                                delay: i * 0.07,
                                                            }}
                                                            className="relative aspect-[9/12] overflow-hidden rounded-xl bg-neutral-800"
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-br from-neutral-600 to-neutral-950" />
                                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-white px-1.5 py-1 text-[4px] font-bold">
                                                                Caption
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>

                                                <motion.div
                                                    animate={{ scale: [1, 1.04, 1] }}
                                                    transition={{
                                                        repeat: Infinity,
                                                        duration: 2,
                                                    }}
                                                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black px-4 py-2 text-[8px] font-medium text-white shadow-xl"
                                                >
                                                    Processing 24 clips
                                                </motion.div>
                                            </div>
                                        )}

                                        {active === 3 && (
                                            <div className="text-center">
                                                <motion.div
                                                    initial={{ scale: 0.7 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 200,
                                                    }}
                                                    className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-black text-white shadow-xl"
                                                >
                                                    <Check size={28} />
                                                </motion.div>

                                                <div className="text-lg font-semibold">
                                                    All done.
                                                </div>

                                                <div className="mt-2 text-[11px] text-neutral-400">
                                                    24 videos are ready to export.
                                                </div>

                                                <button className="mt-6 rounded-full bg-black px-5 py-2.5 text-[10px] font-medium text-white">
                                                    Download batch
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>

                                <div className="flex items-center justify-between border-t border-black/[0.06] pt-4">
                                    <button
                                        onClick={() => setActive(Math.max(0, active - 1))}
                                        disabled={active === 0}
                                        className="flex items-center gap-1 text-[10px] font-medium text-neutral-400 disabled:opacity-30"
                                    >
                                        <ChevronRight className="rotate-180" size={12} />
                                        Back
                                    </button>

                                    <button
                                        onClick={() => setActive(Math.min(3, active + 1))}
                                        disabled={active === 3}
                                        className="flex items-center gap-1 text-[10px] font-medium disabled:opacity-30"
                                    >
                                        Next
                                        <ChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

/* =========================================================
   STATS
========================================================= */

function Stats() {
    return (
        <section className="px-5 py-28">
            <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[30px] border border-black/[0.07] bg-white md:grid-cols-3">
                {[
                    {
                        number: "100+",
                        label: "clips can be processed in one batch",
                    },
                    {
                        number: "1×",
                        label: "caption setup instead of repeating it",
                    },
                    {
                        number: "0",
                        label: "times you need to open every clip",
                    },
                ].map((stat, index) => (
                    <Reveal key={stat.number} delay={index * 0.08}>
                        <div
                            className={`p-8 text-center sm:p-12 ${index !== 2 ? "border-b md:border-b-0 md:border-r" : ""
                                } border-black/[0.07]`}
                        >
                            <div className="text-5xl font-semibold tracking-[-0.06em] sm:text-6xl">
                                {stat.number}
                            </div>

                            <div className="mx-auto mt-3 max-w-[180px] text-[11px] leading-5 text-neutral-400">
                                {stat.label}
                            </div>
                        </div>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}

/* =========================================================
   FAQ
========================================================= */

function FAQ() {
    const [open, setOpen] = useState(null);

    const faqs = [
        {
            q: "How many videos can I upload at once?",
            a: "Captionflow is designed around batch processing, so you can upload multiple clips into a single project and apply the same caption rules across the entire batch.",
        },
        {
            q: "Can I choose exactly when captions appear?",
            a: "Yes. You can define whether captions appear during the first 25%, last 25%, or the entire duration of the video. More granular timing controls can also be added to the workflow.",
        },
        {
            q: "Can every video use the same animation?",
            a: "Yes. Choose your transition once and Captionflow applies that animation consistently across your selected clips.",
        },
        {
            q: "Can I customize fonts and positioning?",
            a: "Yes. The caption system is designed around reusable visual presets so your entire batch can maintain the same typography and positioning.",
        },
        {
            q: "Who is this built for?",
            a: "Anyone producing content at scale — social media teams, marketers, agencies, creators, UGC teams and brands producing lots of short-form video.",
        },
    ];

    return (
        <section className="px-5 py-32 sm:py-44">
            <div className="mx-auto max-w-3xl">
                <Reveal>
                    <div className="mb-14 text-center">
                        <div className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                            FAQ
                        </div>

                        <h2 className="text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
                            Questions, answered.
                        </h2>
                    </div>
                </Reveal>

                <div className="divide-y divide-black/[0.08] border-y border-black/[0.08]">
                    {faqs.map((faq, index) => (
                        <div key={faq.q}>
                            <button
                                onClick={() => setOpen(open === index ? null : index)}
                                className="flex w-full items-center justify-between gap-5 py-6 text-left"
                            >
                                <span className="text-sm font-medium tracking-[-0.01em]">
                                    {faq.q}
                                </span>

                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                                    {open === index ? (
                                        <Minus size={13} />
                                    ) : (
                                        <Plus size={13} />
                                    )}
                                </div>
                            </button>

                            {open === index && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="overflow-hidden"
                                >
                                    <p className="max-w-2xl pb-6 pr-12 text-sm leading-6 text-neutral-500">
                                        {faq.a}
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* =========================================================
   CTA
========================================================= */

function CTA() {
    return (
        <section id="pricing" className="px-5 pb-10">
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
                                Stop editing the same video twice.
                            </span>
                        </div>

                        <h2 className="mx-auto max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-7xl">
                            Make your next
                            <br />
                            hundred videos easier.
                        </h2>

                        <p className="mx-auto mt-7 max-w-md text-sm leading-6 text-white/40">
                            Set the rules once. Process the batch. Spend your time on the
                            content that actually matters.
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
   HOME
========================================================= */

export default function Home() {
    const { scrollYProgress } = useScroll();

    const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

    return (
        <main className="min-h-screen overflow-hidden bg-white font-sans text-black selection:bg-black selection:text-white">
            {/* Scroll progress */}
            <motion.div
                style={{ scaleX: progressScale }}
                className="fixed left-0 right-0 top-0 z-[100] h-[2px] origin-left bg-black"
            />

            <Navbar />

            <Hero />

            <TrustStrip />

            <ProblemSection />

            <HowItWorks />

            <Features />

            <Workflow />

            <Stats />

            <FAQ />

            <CTA />

            <Footer />
        </main>
    );
}