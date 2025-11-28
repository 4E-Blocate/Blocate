import { AnimatedTestimonials } from "@/components/ui/shadcn-io/animated-testimonials";

const testimonials = [
  {
    quote:
      "B-Locate's IoT monitoring has given us peace of mind. We can track patient vitals in real time and respond instantly to emergencies. It's a game changer for our care facility.",
    name: "Owen Pratama",
    designation: "Medical Manager at Hermina Hospital",
    src: "/owen_pratama.png",
  },
  {
    quote:
      "The device setup was quick and easy. Our team now receives instant alerts for any health anomalies, making our response faster and more effective than ever before.",
    name: "Fadil Fawaz",
    designation: "Head of IT at Panti Prajatama",
    src: "/fadil_fawaz.png",
  },
  {
    quote:
      "B-Locate helps us monitor multiple patients at once. The dashboard is intuitive, and the data accuracy has improved our daily operations and patient safety.",
    name: "Joko Malik",
    designation: "Senior Nurse at TPA Sri Ratu",
    src: "/joko_malik.jpg",
  }
];

export default function Testimony() {
  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      {/* Testimony Section Title */}
      <div className="mb-2 text-center">
        <h4 className="text-[#02476D] font-bold text-lg mb-2 tracking-wide">TESTIMONIALS</h4>
        <h2 className="text-4xl md:text-5xl font-bold text-[#1D1D1F] mb-4">What Our Customers Say</h2>
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
          Discover how B-Locate has transformed organizations and empowered teams. Real stories from real users about impact, reliability, and support.
        </p>
      </div>
      <AnimatedTestimonials testimonials={testimonials} />;
    </section>
  );
}