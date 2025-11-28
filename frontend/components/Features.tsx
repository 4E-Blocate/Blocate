import {
    Radio, Activity, Bot, HeartPulse, Users, ScrollText, Bell, Zap
} from 'lucide-react';

function Features() {
    return (
        <section className="py-20 px-6 max-w-6xl mx-auto">
            {/* Features Section Title */}
            <div className="mb-12 text-center">
                <h4 className="text-[#02476D] font-bold text-lg mb-2 tracking-wide">FEATURES</h4>
                <h2 className="text-4xl md:text-5xl font-bold text-[#1D1D1F] mb-4">What B-Locate Offers</h2>
                <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
                    Powered by IoT sensors and blockchain-based access control, B-Locate delivers
                    real-time vitals, AI-assisted analysis, and scalable multi-user tracking in a
                    unified platform.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16">
                {/* Feature 1 — Real-time GPS Tracking */}
                <div className="flex flex-col items-center text-center gap-4">
                    <Radio size={48} className="stroke-[1.5px] text-[#1D1D1F]" />
                    <h3 className="text-xl md:text-2xl font-bold text-[#1D1D1F] leading-tight">
                        Real-time<br />location tracking
                    </h3>
                </div>

                {/* Feature 2 — Health Sensor Monitoring */}
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-[#1D1D1F] flex items-center justify-center">
                        <Activity size={24} className="stroke-[2px] text-[#1D1D1F]" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-[#1D1D1F] leading-tight">
                        Live SpO2 &<br />heart rate data
                    </h3>
                </div>

                {/* Feature 3 — AI Summary */}
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 rounded-lg border-2 border-[#1D1D1F] flex items-center justify-center">
                        <Bot size={28} className="stroke-[2px] text-[#1D1D1F]" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-[#1D1D1F] leading-tight">
                        Automatic<br />AI summaries
                    </h3>
                </div>

                {/* Feature 4 — Status Tracking */}
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 rounded-lg border-2 border-[#1D1D1F] flex items-center justify-center">
                        <HeartPulse size={28} className="stroke-[2px] text-[#1D1D1F]" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-[#1D1D1F] leading-tight">
                        Daily status<br />monitoring
                    </h3>
                </div>

                {/* Feature 5 — One-to-Many Caregiver View */}
                <div className="flex flex-col items-center text-center gap-4">
                    <Users size={48} className="stroke-[1.5px] text-[#1D1D1F]" />
                    <h3 className="text-xl md:text-2xl font-bold text-[#1D1D1F] leading-tight">
                        One-to-many<br />care monitoring
                    </h3>
                </div>

                {/* Feature 6 — Smart Contract Access Control */}
                <div className="flex flex-col items-center text-center gap-4">
                    <ScrollText size={48} className="stroke-[1.5px] text-[#1D1D1F]" />
                    <h3 className="text-xl md:text-2xl font-bold text-[#1D1D1F] leading-tight">
                        Secure access<br />via smart contracts
                    </h3>
                </div>

                {/* Feature 7 — Dashboard & Alerts */}
                <div className="flex flex-col items-center text-center gap-4">
                    <Bell size={48} className="stroke-[1.5px] text-[#1D1D1F]" />
                    <h3 className="text-xl md:text-2xl font-bold text-[#1D1D1F] leading-tight">
                        Alerts &<br />dashboard view
                    </h3>
                </div>

                {/* Feature 8 — Fast & Responsive App */}
                <div className="flex flex-col items-center text-center gap-4">
                    <Zap size={48} className="stroke-[1.5px] text-[#1D1D1F] fill-[#1D1D1F]" />
                    <h3 className="text-xl md:text-2xl font-bold text-[#1D1D1F] leading-tight">
                        Fast and<br />
                        <span className="relative inline-block mt-1">
                            responsive app
                            <svg className="absolute -top-1 -left-6 w-[120%] h-[130%] text-[#6ff3ea]" viewBox="0 0 100 60" preserveAspectRatio="none">
                                <path d="M5,30 Q20,5 50,5 T95,30 T50,55 T5,30" fill="none" stroke="currentColor" strokeWidth="3" />
                            </svg>
                        </span>
                    </h3>
                </div>

            </div>

        </section>
    )
}

export default Features