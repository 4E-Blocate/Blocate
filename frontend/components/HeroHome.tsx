import { LayoutDashboard, Radio, ScrollText } from 'lucide-react';
import Link from 'next/link';

function HeroHome() {
    return (
        <main className="flex flex-col items-center justify-center pt-12 px-4 text-center max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.1] font-bold tracking-tight mb-12 text-[#1D1D1F]">
                Peace of{' '}
                <span className="relative inline-block px-2">
                    <span className="absolute bottom-3 left-0 w-full h-1/2 bg-[#6ff3ea] transform -rotate-1"></span>
                    <span className="relative z-10">mind</span>
                </span>
                <br />
                with every heartbeat
            </h1>

            <div className="flex flex-col md:flex-row items-center gap-8 mt-4 mb-20">
                {/* Main CTA */}
                <Link href="/login" className="bg-[#1D1D1F] text-white px-8 py-4 rounded-2xl font-semibold text-lg flex items-center gap-3 hover:scale-105 transition-transform duration-200 shadow-xl shadow-black/10">
                    <LayoutDashboard size={24} className="fill-current" />
                    <span>Get Started</span>
                </Link>

                {/* Social Proof */}
                <div className="flex items-center gap-8 text-gray-400 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                    {/* Mock "Featured on App Store" Badge */}
                    <div className="flex items-center gap-2">
                        <Radio size={32} className="stroke-[1.5px]" />
                        <div className="flex flex-col items-start text-xs font-sans leading-tight">
                            <span>Powered by</span>
                            <span className="font-bold text-sm font-sans text-gray-500">IoT Sensors</span>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-gray-300/50"></div>

                    {/* Mock "Featured in Forbes" Badge */}
                    <div className="flex items-center gap-2">
                        <ScrollText size={28} className="stroke-[1.5px]" />
                        <div className="flex flex-col items-start text-xs font-sans leading-tight">
                            <span>Secured with</span>
                            <span className="font-bold text-sm font-sans text-gray-500">Smart Contracts</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default HeroHome