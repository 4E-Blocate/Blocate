"use client";

import Sidebar from "@/components/Sidebar";
import { ArrowRight, CirclePlus, Home, MapPin, Search, RefreshCw, Loader2 } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ethers } from 'ethers';

// Configuration
const CONFIG = {
  CONTRACT_ADDRESS: "0x717CD91f1C0897CEc98e3e1F85d3Cd6FE7D73C4B",
  SEPOLIA_CHAIN_ID: "0xaa36a7",
};

const CONTRACT_ABI = [
  "function getGuardianDevices(address guardian) view returns (string[])",
  "function getDevice(string deviceId) view returns (tuple(string deviceId, address patient, address guardian, string fullName, uint8 age, string homeLocation, bool isActive, uint256 registeredAt))",
];

// Define the Patient Interface
interface PatientData {
  id: string; // deviceId
  no: number;
  img: string;
  name: string;
  location: string; // Replaces 'disease' or 'distance' based on contract data
  age: number;
  isActive: boolean;
}

export default function PatientPage() {
  const path = usePathname();
  const router = useRouter();

  // State
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [filteredPayload, setFilteredPayload] = useState<PatientData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // 1. Fetch Data from Blockchain
  const fetchPatientsFromBlockchain = async () => {
    setIsLoading(true);
    try {
      if (typeof window.ethereum === 'undefined') {
        alert("Please install MetaMask");
        setIsLoading(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setWalletAddress(userAddress);

      const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Get list of Device IDs guarded by this user
      console.log("Fetching devices for guardian:", userAddress);
      const deviceIds: string[] = await contract.getGuardianDevices(userAddress);

      if (!deviceIds || deviceIds.length === 0) {
        setPatients([]);
        setFilteredPayload([]);
        setIsLoading(false);
        return;
      }

      // Fetch details for each device
      const loadedPatients = await Promise.all(
        deviceIds.map(async (deviceId, index) => {
          try {
            const data = await contract.getDevice(deviceId);
            
            // Map Contract Data to UI Structure
            return {
              id: data.deviceId,
              no: index + 1,
              img: "placeholder.svg", // Static image as contract doesn't store photos
              name: data.fullName,
              location: data.homeLocation,
              age: Number(data.age), // Convert BigInt to Number
              isActive: data.isActive,
            };
          } catch (err) {
            console.error(`Error fetching device ${deviceId}`, err);
            return null;
          }
        })
      );

      // Filter out nulls (failed fetches)
      const validPatients = loadedPatients.filter((p): p is PatientData => p !== null);
      
      setPatients(validPatients);
      setFilteredPayload(validPatients);

    } catch (error) {
      console.error("Error loading blockchain data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchPatientsFromBlockchain();
    
    // Listen for account changes
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', () => window.location.reload());
    }
  }, []);

  // 2. Filter Logic (Search)
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = patients.filter(
      (data) =>
        data.name.toLowerCase().includes(lowercasedQuery) ||
        data.id.toLowerCase().includes(lowercasedQuery) ||
        data.location.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredPayload(filtered);
  }, [searchQuery, patients]);

  return (
    <div className="h-screen w-full flex bg-[#02476D] font-sans">
      {/* Left Panel: Branding & Pattern */}
      <div className="hidden md:flex md:w-1/4 bg-[#02476D] relative flex-col items-center justify-center p-4 text-white">
        <div className="absolute inset-0 z-0">
          <Image
            src="/bg_pattern.svg"
            alt="Background Pattern"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Sidebar */}
        <Sidebar path={path} />
      </div>

      {/* Right Panel: Patients */}
      <div className="w-full md:w-3/4 flex flex-col">
        <div className="w-full flex flex-col space-y-6 h-full px-4 sm:px-12 py-7.5 bg-white rounded-2xl text-[#003552] overflow-hidden">
          {/* Breadcrumb */}
          <div className="flex items-center text-base gap-2 font-medium">
            <Home />
            Home
          </div>

          {/* Title & Wallet Info */}
          <div className="flex justify-between items-end">
            <div>
                <h1 className="text-4xl font-semibold">Pasien Saya</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Guardian: {walletAddress ? `${walletAddress.substring(0,6)}...${walletAddress.slice(-4)}` : 'Not Connected'}
                </p>
            </div>
            
            <button 
                onClick={fetchPatientsFromBlockchain} 
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                title="Refresh Data"
            >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search */}
          <div className="flex gap-4">
            <div className="w-full relative">
              <input
                placeholder="Search by name, ID, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-[#333333] rounded-xl px-4 h-full font-medium bg-[#E8E8E8] placeholder:text-[#8E8E8E] w-full focus:outline-[#02476D]"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
            {/* The 'Tambah' button logic would route to the registration page you created earlier */}
            <button
              type="button"
              onClick={() => router.push('/add-patient')} 
              className="flex items-center gap-3 justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-[#02476D] font-medium hover:bg-[#023c5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B5E] transition-colors duration-200 whitespace-nowrap"
            >
              Tambah
              <CirclePlus />
            </button>
          </div>

          {/* List of Patients */}
          <div className="flex-1 text-white space-y-6 overflow-auto pb-4">
            
            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-40 text-[#003552]">
                    <Loader2 className="w-10 h-10 animate-spin mb-2" />
                    <p>Fetching devices from Blockchain...</p>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredPayload.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-[#003552] border-2 border-dashed border-gray-300 rounded-3xl">
                    <p className="text-lg font-medium">No patients found</p>
                    <p className="text-sm text-gray-500">Register a device to see it here.</p>
                </div>
            )}

            {/* Data Cards */}
            {!isLoading && filteredPayload.map((data, index) => (
              <div
                key={index}
                className="flex gap-6 border-4 relative border-[#003552] bg-[#115276] rounded-3xl py-3 sm:py-5 px-3 sm:px-12 transition-transform"
              >
                {/* Number */}
                <div className="hidden sm:block text-xl font-medium absolute top-4 left-4">
                  #{data.no}
                </div>

                {/* Picture */}
                <div className="hidden sm:block relative size-25 z-10 overflow-hidden rounded-full border-2 border-white/20">
                  <Image src={`/${data.img}`} alt="profile" fill className="object-cover" />
                </div>

                {/* Data */}
                <div className="flex-1 flex flex-col justify-between z-10">
                  <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl sm:text-3xl font-semibold">{data.name}</h1>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${data.isActive ? 'bg-green-500/20 border-green-400 text-green-200' : 'bg-red-500/20 border-red-400 text-red-200'}`}>
                            {data.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <p className="opacity-80">{data.age} y.o</p>
                    <p className="text-xs text-blue-200 mt-1">ID: {data.id}</p>
                  </div>
                </div>

                {/* Additional */}
                <div className="flex flex-col items-end justify-between z-10">
                  {/* Location / GPS */}
                  <div className="w-fit flex gap-2 items-center rounded-xl font-semibold bg-white py-1.5 px-3">
                    <span className="text-[#003552] text-sm max-w-[150px] truncate">{data.location}</span>
                    <MapPin className="text-[#003552] w-4 h-4" />
                  </div>

                  {/* Details Button */}
                  <button
                    type="button"
                    onClick={() => router.push(`/patient/${data.id}`)}
                    className="flex text-sm items-center justify-center py-3 mt-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-[#16929C] font-medium hover:bg-[#0e7880] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B5E] transition-colors duration-200"
                  >
                    Lihat Detail
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                </div>

                {/* Decorative Element */}
                <div className="absolute h-full right-0 top-0 opacity-50 pointer-events-none">
                  <Image
                    src="/card_element.svg"
                    alt="decorative element"
                    width={270}
                    height={160}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}