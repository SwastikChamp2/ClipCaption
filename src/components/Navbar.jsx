import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { label: "Home", to: "/" },
        { label: "Playground", to: "/playground" },
        { label: "Demo", to: "/demo" },
    ];

    return (
        <nav className="fixed left-0 right-0 top-0 z-50 px-4 pt-4">
            <div className="relative mx-auto flex max-w-7xl items-center justify-between rounded-full border border-black/[0.07] bg-white/80 px-4 py-2.5 shadow-[0_8px_40px_rgba(0,0,0,0.05)] backdrop-blur-xl md:px-5">

                {/* Logo */}
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

                {/* Desktop Navigation (Centered) */}
                <div className="hidden items-center gap-8 md:flex md:absolute md:left-1/2 md:-translate-x-1/2">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.to;
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`text-[13px] font-medium transition ${
                                    isActive
                                        ? "text-black font-semibold"
                                        : "text-neutral-500 hover:text-black"
                                }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Right Action Button */}
                <div className="hidden items-center gap-3 md:flex">
                    <Link
                        to="/playground"
                        className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-[13px] font-medium text-white transition hover:bg-neutral-800"
                    >
                        Open Playground
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 md:hidden"
                    aria-label="Toggle navigation menu"
                >
                    {menuOpen ? <FiX size={17} /> : <FiMenu size={17} />}
                </button>
            </div>

            {/* Mobile Navigation */}
            {menuOpen && (
                <div className="mx-auto mt-2 max-w-7xl rounded-3xl border border-black/[0.06] bg-white p-5 shadow-xl md:hidden">
                    <div className="flex flex-col gap-5">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setMenuOpen(false)}
                                className={`text-sm ${
                                    location.pathname === link.to ? "font-semibold text-black" : "text-neutral-600"
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}

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