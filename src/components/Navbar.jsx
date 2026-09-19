import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiArrowRight, FiMenu, FiX } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    const isPlayground = location.pathname === "/playground";

    return (
        <nav className="fixed left-0 right-0 top-0 z-50 px-4 pt-4">
            <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-black/[0.07] bg-white/80 px-4 py-2.5 shadow-[0_8px_40px_rgba(0,0,0,0.05)] backdrop-blur-xl md:px-5">

                <Link
                    to="/"
                    className="flex items-center gap-2.5"
                    onClick={() => setMenuOpen(false)}
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-black text-white">
                        <HiSparkles size={15} />
                    </div>

                    <span className="text-[15px] font-semibold tracking-[-0.04em]">
                        caption<span className="text-neutral-400">flow</span>
                    </span>
                </Link>

                <div className="hidden items-center gap-8 md:flex">
                    <Link
                        to="/#how"
                        className="text-[13px] font-medium text-neutral-500 transition hover:text-black"
                    >
                        How it works
                    </Link>

                    <Link
                        to="/#features"
                        className="text-[13px] font-medium text-neutral-500 transition hover:text-black"
                    >
                        Features
                    </Link>

                    <Link
                        to="/#workflow"
                        className="text-[13px] font-medium text-neutral-500 transition hover:text-black"
                    >
                        Workflow
                    </Link>

                    <Link
                        to="/#pricing"
                        className="text-[13px] font-medium text-neutral-500 transition hover:text-black"
                    >
                        Pricing
                    </Link>
                </div>

                <div className="hidden items-center gap-3 md:flex">
                    {!isPlayground && (
                        <button className="px-3 py-2 text-[13px] font-medium text-neutral-500 transition hover:text-black">
                            Log in
                        </button>
                    )}

                    <Link
                        to="/playground"
                        className="group flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-neutral-800"
                    >
                        {isPlayground ? "Workspace" : "Start creating"}

                        <FiArrowRight
                            size={14}
                            className="transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                    </Link>
                </div>

                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 md:hidden"
                >
                    {menuOpen ? <FiX size={17} /> : <FiMenu size={17} />}
                </button>
            </div>

            {menuOpen && (
                <div className="mx-auto mt-2 max-w-7xl rounded-3xl border border-black/[0.06] bg-white p-5 shadow-xl md:hidden">
                    <div className="flex flex-col gap-5">
                        <Link
                            to="/#how"
                            onClick={() => setMenuOpen(false)}
                            className="text-sm"
                        >
                            How it works
                        </Link>

                        <Link
                            to="/#features"
                            onClick={() => setMenuOpen(false)}
                            className="text-sm"
                        >
                            Features
                        </Link>

                        <Link
                            to="/#workflow"
                            onClick={() => setMenuOpen(false)}
                            className="text-sm"
                        >
                            Workflow
                        </Link>

                        <Link
                            to="/#pricing"
                            onClick={() => setMenuOpen(false)}
                            className="text-sm"
                        >
                            Pricing
                        </Link>

                        <Link
                            to="/playground"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center justify-center rounded-full bg-black py-3 text-sm font-medium text-white"
                        >
                            Open Playground
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}