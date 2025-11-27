import { History, Home, LogOut, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Sidebar = ({ path }: { path: string }) => {
  const router = useRouter();

  const payload = {
    name: "Jesaya David",
    role: "Guardian",
  };

  return (
    <div className="relative flex h-full flex-col justify-center items-center gap-3 w-full z-10">
      {/* Profile */}
      <div className="relative size-32 rounded-full overflow-hidden">
        <Image
          src="/placeholder.svg"
          alt="Placeholder John Doe"
          fill
          className="object-cover"
          priority
        />
      </div>

      <h1 className="text-[30px] font-semibold text-center"> {payload.name}</h1>
      <p className="px-4 py-2 text-[#02476D] font-semibold rounded-full text-base bg-white">
        {payload.role}
      </p>

      {/* Navigation */}
      <div className="w-full space-y-2 my-4">
        <button
          onClick={() => router.push("/patient")}
          className={`${path.startsWith("/patient") && "bg-white/20"
            } w-full flex gap-3 items-center px-3 lg:px-4 py-3 rounded-lg`}
        >
          <Home />
          Home
        </button>
        <button
          onClick={() => router.push("/history")}
          className={`${path.startsWith("/history") && "bg-white/20"
            } w-full flex gap-3 items-center px-3 lg:px-4 py-3 rounded-lg`}
        >
          <History />
          History
        </button>
        <button
          onClick={() => router.push("/product")}
          className={`${path.startsWith("/product") && "bg-white/20"
            } w-full flex gap-3 items-center px-3 lg:px-4 py-3 rounded-lg`}
        >
          <ShoppingBag />
          Our Product
        </button>
      </div>

      {/* Logout Button */}
      <button
        type="button"
        className="w-full flex items-center gap-3 justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-[#D00416] bg-white font-medium hover:bg-[#D1D1D1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B5E] transition-colors duration-200"
      >
        <LogOut />
        Logout
      </button>

      {/* Bottom logo */}
      <div className="hidden xl:flex absolute left-0 bottom-0 items-center justify-center gap-3 mb-8">
        <Image src="/logo.png" alt="B-Locate Logo" width={64} height={64} />
        <h2 className="text-2xl font-bold text-white">B-Locate</h2>
      </div>
    </div>
  );
};

export default Sidebar;
