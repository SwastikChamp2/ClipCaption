import React from "react";
import { Link } from "react-router-dom";
import { HiSparkles } from "react-icons/hi2";

export default function Footer() {
    return (
        <footer className="px-5 pb-8 pt-12">
            <div className="mx-auto flex max-w-6xl flex-col gap-8 border-t border-black/[0.07] pt-8 sm:flex-row sm:items-center sm:justify-between">

                <Link to="/" className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-white">
                        <HiSparkles size={13} />
                    </div>

                    <span className="text-sm font-semibold tracking-[-0.03em]">
                        caption<span className="text-neutral-400">flow</span>
                    </span>
                </Link>

                <div className="flex flex-wrap gap-6 text-[11px] text-neutral-400">
                    <Link to="/#features" className="transition hover:text-black">
                        Features
                    </Link>

                    <Link to="/#pricing" className="transition hover:text-black">
                        Pricing
                    </Link>

                    <a href="#" className="transition hover:text-black">
                        Privacy
                    </a>

                    <a href="#" className="transition hover:text-black">
                        Terms
                    </a>
                </div>

                <div className="text-[10px] text-neutral-400">
                    © {new Date().getFullYear()} Captionflow
                </div>
            </div>
        </footer>
    );
}