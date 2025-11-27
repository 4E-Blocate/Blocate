import {
    Activity,
    Users,
    TrendingUp,
    User
} from 'lucide-react';

function Statistics() {
    return (
        <section className="pt-20 px-6 max-w-6xl mx-auto">
            {/* Statistics Section Title */}
            <div className="mb-2 text-center">
                <h4 className="text-[#02476D] font-bold text-lg mb-2 tracking-wide">STATISTICS</h4>
                <h2 className="text-4xl md:text-5xl font-bold text-[#1D1D1F] mb-4">Mental Health Impact</h2>
                <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
                    Millions are affected by dementia, schizophrenia, and delirium every year. These conditions lead to high-risk incidents and hospitalizations for families.
                </p>
            </div>
            
            <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* LEFT COLUMN */}
                <div className="lg:col-span-8 flex flex-col gap-10">

                    {/* Dementia */}
                    <div className="rounded-3xl p-8 shadow-lg shadow-cyan-900/5 border border-cyan-100 hover:shadow-cyan-900/10 transition-shadow">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[#0F172A]">Dementia</h3>
                                    <p className="text-xs text-slate-500 font-medium">Gradual decline in memory and thinking</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-extrabold text-blue-700">1.8M Cases</span>
                                <p className="text-xs text-blue-500 font-semibold mt-1">Every year, lives are changed forever</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6">
                            <p className="text-sm text-slate-600 mb-4">
                                <span className="font-semibold text-blue-600">30%</span> of missing incidents result in <span className="font-semibold text-blue-600">severe injury or death</span> before rescue.
                            </p>
                            {/* 10 Person Icons Visualization */}
                            <div className="flex justify-between items-center gap-1">
                                {[...Array(10)].map((_, i) => (
                                    <User
                                        key={i}
                                        className={`w-8 h-8 ${i < 3 ? 'text-blue-500 fill-blue-500' : 'text-slate-200 fill-slate-200'}`}
                                        strokeWidth={1.5}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-1">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                            </div>
                        </div>
                    </div>

                    {/* Schizophrenia */}
                    <div className="rounded-3xl p-8 shadow-lg shadow-cyan-900/5 border border-teal-100 hover:shadow-cyan-900/10 transition-shadow flex-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-teal-100 rounded-xl">
                                    <Activity className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[#0F172A]">Schizophrenia</h3>
                                    <p className="text-xs text-slate-500 font-medium">Chronic disorder causing hallucinations and delusions</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-extrabold text-teal-700">400K+ Affected</span>
                                <p className="text-xs text-teal-500 font-semibold mt-1">Each case is a story of struggle and hope</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Radial Gauge Visualization */}
                            <div className="relative w-60 h-60 shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-slate-100"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="text-teal-500"
                                        strokeDasharray="20, 100"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-5xl font-bold text-teal-700">20%</span>
                                </div>
                            </div>

                            <p className="text-sm text-slate-600 leading-snug">
                                Adults reported missing have a diagnosed <span className="font-semibold text-teal-600">severe mental illness</span> like schizophrenia.
                            </p>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-4 rounded-3xl p-8 shadow-lg shadow-cyan-900/5 border border-slate-100 hover:shadow-cyan-900/10 transition-shadow flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-sky-100 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-sky-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#0F172A]">Delirium</h3>
                                <p className="text-slate-500 text-xs font-medium">Sudden, temporary state of confusion</p>
                            </div>
                        </div>

                        <div className="text-center py-6">
                            <div className="inline-block relative">
                                <span className="text-5xl font-bold text-sky-700 tracking-tighter">50%</span>
                            </div>
                            <p className="text-slate-500 font-medium mt-2">of all mental patients may suffer form Delirium episodes.</p>
                        </div>
                    </div>

                    {/* Comparative Bar Chart */}
                    <div className="bg-slate-50 rounded-2xl p-6 mt-6 min-h-[200px] flex items-end justify-center gap-8 pb-4">

                        {/* Left Bar - General */}
                        <div className="flex flex-col items-center gap-2 group">
                            <span className="text-xs font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">20-30%</span>
                            <div className="w-24 bg-slate-200 rounded-t-xl relative h-24 hover:bg-slate-300 transition-colors"></div>
                            <span className="text-xs font-bold text-slate-400 mt-1">General</span>
                        </div>

                        {/* Right Bar - Post-Surgery Spike */}
                        <div className="flex flex-col items-center gap-2 group">
                            <span className="text-xs font-bold text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity">50%</span>
                            <div className="w-24 bg-sky-500 rounded-t-xl relative h-48 shadow-lg shadow-sky-200 hover:bg-sky-400 transition-colors">
                                <div className="absolute top-0 w-full h-full bg-white opacity-10 rounded-t-xl"></div>
                            </div>
                            <span className="text-xs font-bold text-sky-700 mt-1">Post Operation</span>
                        </div>

                    </div>
                    <p className="text-center text-sm text-slate-600 mt-4 leading-relaxed">
                        Delirium affects <span className="font-bold text-sky-600">1 in 3</span> seniors. Up to <span className="font-bold text-sky-600">half</span> after surgery.
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Statistics