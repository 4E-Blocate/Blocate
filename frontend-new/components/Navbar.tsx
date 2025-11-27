"use client";

import Image from "next/image";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    return (
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : ''}`}>
            <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto w-full">
                <Image
                    src="/logo.png"
                    alt="B-Locate Logo"
                    width={50}
                    height={50}
                    priority
                />

                <div className="flex items-center gap-6">
                    <Link href="/patient" className="bg-[#EAE6DF] hover:bg-[#dcd8d1] transition-colors text-[#1D1D1F] px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2">
                        <LayoutDashboard size={20} className="fill-current" />
                        <span>Dashboard</span>
                    </Link>
                </div>
            </div>
        </nav>
    )
}

export default Navbar