"use client";

import { History, Home, LogOut, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Configuration from main.js
const CONFIG = {
  CONTRACT_ADDRESS: "0x717CD91f1C0897CEc98e3e1F85d3Cd6FE7D73C4B",
};

// Minimal ABI to fetch the guardian name
const CONTRACT_ABI = [
  "function getGuardianName(address guardian) view returns (string)",
];

const Sidebar = ({ path }: { path: string }) => {
  const router = useRouter();

  // State to hold dynamic data
  const [guardianName, setGuardianName] = useState<string>("Loading...");
  const [walletAddress, setWalletAddress] = useState<string>("");

  useEffect(() => {
    const fetchGuardianData = async () => {
      // 1. Check for MetaMask
      if (typeof window.ethereum !== "undefined") {
        try {
          // 2. Setup Provider & Signer
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setWalletAddress(address);

          // 3. Instantiate Contract
          const contract = new ethers.Contract(
            CONFIG.CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
          );

          // 4. Fetch Guardian Name
          const name = await contract.getGuardianName(address);

          // 5. Update State (Fallback to shortened address if name is empty)
          if (name && name.trim() !== "") {
            setGuardianName(name);
          } else {
            // If no name set, show shortened wallet address (e.g. 0x123...456)
            setGuardianName(
              `${address.substring(0, 6)}...${address.substring(38)}`
            );
          }
        } catch (error) {
          console.error("Error fetching guardian name:", error);
          setGuardianName("Not Connected");
        }
      } else {
        setGuardianName("No Wallet");
      }
    };

    fetchGuardianData();
  }, []);

  const payload = {
    name: "Jesaya David", // Now dynamic
    role: "Guardian",   // Kept static as requested
  };

  return (
    <div className="relative flex h-full flex-col justify-center items-center gap-3 w-full z-10">
      {/* Profile */}
      <div className="relative size-32 rounded-full overflow-hidden border-4 border-white/10">
        <Image
          src="/placeholder.svg"
          alt="Profile Picture"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="text-center">
        <h1 className="text-[24px] xl:text-[30px] font-semibold text-white px-2 break-words max-w-[250px]">
          {payload.name}
        </h1>
        {/* Optional: Show wallet address below name if needed */}
        {/* <p className="text-xs text-blue-200 mt-1">{walletAddress.substring(0,6)}...{walletAddress.substring(38)}</p> */}
      </div>

      <p className="px-4 py-2 text-[#02476D] font-semibold rounded-full text-base bg-white mt-2">
        {payload.role}
      </p>

      {/* Navigation */}
      <div className="w-full space-y-2 my-4 text-white">
        <button
          onClick={() => router.push("/patient")}
          className={`${
            path.startsWith("/patient") && "bg-white/20"
          } w-full flex gap-3 items-center px-3 lg:px-4 py-3 rounded-lg hover:bg-white/10 transition-colors`}
        >
          <Home />
          Home
        </button>
        <button
          onClick={() => router.push("/history")}
          className={`${
            path.startsWith("/history") && "bg-white/20"
          } w-full flex gap-3 items-center px-3 lg:px-4 py-3 rounded-lg hover:bg-white/10 transition-colors`}
        >
          <History />
          History
        </button>
        <button
          onClick={() => router.push("/product")}
          className={`${
            path.startsWith("/product") && "bg-white/20"
          } w-full flex gap-3 items-center px-3 lg:px-4 py-3 rounded-lg hover:bg-white/10 transition-colors`}
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
      <div className="hidden xl:flex absolute left-0 bottom-0 items-center justify-center gap-3 mb-8 w-full">
        <Image src="/logo.png" alt="B-Locate Logo" width={64} height={64} />
        <h2 className="text-2xl font-bold text-white">B-Locate</h2>
      </div>
    </div>
  );
};

export default Sidebar;