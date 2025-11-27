import Image from "next/image"

function Company() {
    return (
        <section className="py-20 px-6 max-w-6xl mx-auto">
            {/* Company Section Title */}
            <div className="mb-12 text-center">
                <h4 className="text-[#02476D] font-bold text-lg mb-2 tracking-wide">THEY TRUST US</h4>
                <h2 className="text-4xl md:text-5xl font-bold text-[#1D1D1F] mb-4">Trusted by Leading Organizations</h2>
                <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
                    B-Locate serves hospitals and senior care centers to safeguard those at risk. Our platform delivers real-time location and health data, helping organizations keep loved ones safe.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
                <div className="flex flex-col items-center justify-center text-center gap-4">
                    <Image
                        src="/logo_hermina.png"
                        alt="Hermina Hospital Logo"
                        width={250}
                        height={250}
                        className="object-contain"
                    />
                </div>

                <div className="flex flex-col items-center justify-center text-center gap-4">
                    <Image
                        src="/logo_kanopi.png"
                        alt="Kanopi Nursing Home Logo"
                        width={300}
                        height={300}
                        className="object-contain"
                    />
                </div>

                <div className="flex flex-col items-center justify-center text-center gap-4">
                    <Image
                        src="/logo_wreda.jpg"
                        alt="Wreda Nursing Home Logo"
                        width={220}
                        height={220}
                        className="object-contain"
                    />
                </div>
            </div>
        </section>
    )
}

export default Company