import Image from "next/image";

function DashboardPreview() {
    return (
        <section className="px-6 w-full relative flex items-center justify-center">
            <div className="relative rounded-xl overflow-hidden shadow-2xl border-t border-white/20 max-w-5xl">
                <Image
                    src="/dashboard_view.svg"
                    alt="B-Locate Dashboard Preview"
                    width={1440}
                    height={1308}
                />
            </div>
        </section>
    )
}

export default DashboardPreview