"use client";

import Sidebar from "@/components/Sidebar";
import { ArrowRight, ChevronRight, Home, MapPin, PlusCircle, Search } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ethers } from 'ethers';

// --- CONFIGURATION FROM MAIN.JS ---
const CONFIG = {
    CONTRACT_ADDRESS: "0x717CD91f1C0897CEc98e3e1F85d3Cd6FE7D73C4B",
    SEPOLIA_CHAIN_ID: "0xaa36a7", // 11155111 in decimal
};

const CONTRACT_ABI = [
    "function registerDevice(string deviceId, address guardian, string fullName, uint8 age, string homeLocation)",
    "function isDeviceRegistered(string deviceId) view returns (bool)",
];

export default function PatientPage() {
    const path = usePathname();
    const router = useRouter();

    // Loading state for transaction
    const [isLoading, setIsLoading] = useState(false);

    // Form state matching Contract ABI requirements
    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        deviceId: '',
        homeLocation: '', // GPS format: lat,long
        guardianAddress: '' // Optional: Defaults to sender if empty
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Check for MetaMask
            if (typeof window.ethereum === 'undefined') {
                alert("Please install MetaMask!");
                setIsLoading(false);
                return;
            }

            // 2. Connect Wallet
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();

            // 3. Validate Inputs
            const { deviceId, fullName, age, homeLocation, guardianAddress } = formData;
            
            // Validate GPS format (Simple Regex from main.js)
            if (!homeLocation.match(/^-?\d+\.?\d*,-?\d+\.?\d*$/)) {
                alert('Invalid GPS format. Use: latitude,longitude (e.g., 14.5995,120.9842)');
                setIsLoading(false);
                return;
            }

            // Determine Guardian (User input or current wallet)
            const finalGuardian = guardianAddress.trim() || userAddress;
            if (!ethers.isAddress(finalGuardian)) {
                alert('Invalid guardian wallet address format!');
                setIsLoading(false);
                return;
            }

            // 4. Interact with Contract
            const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            // Check if registered
            const isRegistered = await contract.isDeviceRegistered(deviceId);
            if (isRegistered) {
                alert(`Device ${deviceId} is already registered!`);
                setIsLoading(false);
                return;
            }

            // Execute Registration
            const tx = await contract.registerDevice(
                deviceId,
                finalGuardian,
                fullName,
                parseInt(age),
                homeLocation
            );

            console.log("Transaction sent:", tx.hash);
            
            // Wait for confirmation
            await tx.wait();

            alert("✅ Device registered successfully!");
            
            // Optional: Reset form or redirect
            setFormData({ fullName: '', age: '', deviceId: '', homeLocation: '', guardianAddress: '' });
            
        } catch (error: any) {
            console.error("Registration Error:", error);
            let errorMsg = 'Registration failed: ';
            if (error.code === 'ACTION_REJECTED') {
                errorMsg += 'Transaction was rejected by user';
            } else if (error?.message?.includes('insufficient funds')) {
                errorMsg += 'Insufficient funds for gas.';
            } else {
                errorMsg += error.message || "Unknown error";
            }
            alert(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

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
                        <ChevronRight />
                        <PlusCircle />
                        Tambah Pasien
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl font-semibold">Tambah Pasien</h1>

                    <div>
                        <form className="space-y-4" onSubmit={handleRegister}>

                            {/* Full Name Input */}
                            <div className="space-y-2">
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                    Nama Lengkap Pasien
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    placeholder="Enter full name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* Device & Age Row */}
                            <div className="flex gap-4">
                                <div className="w-1/2 space-y-2">
                                    <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700">
                                        Device ID
                                    </label>
                                    <input
                                        id="deviceId"
                                        name="deviceId"
                                        type="text"
                                        required
                                        placeholder="e.g. ESP32-001"
                                        value={formData.deviceId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                <div className="w-1/2 space-y-2">
                                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                                        Umur (Age)
                                    </label>
                                    <input
                                        id="age"
                                        name="age"
                                        type="number"
                                        required
                                        placeholder="Enter age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Location Input (GPS) */}
                            <div className="space-y-2">
                                <label htmlFor="homeLocation" className="block text-sm font-medium text-gray-700">
                                    Home Location (GPS)
                                </label>
                                <input
                                    id="homeLocation"
                                    name="homeLocation"
                                    type="text"
                                    required
                                    placeholder="latitude,longitude (e.g. 14.5995,120.9842)"
                                    value={formData.homeLocation}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* Guardian Input (Optional) */}
                            <div className="space-y-2">
                                <label htmlFor="guardianAddress" className="block text-sm font-medium text-gray-700">
                                    Guardian Wallet Address (Optional)
                                </label>
                                <input
                                    id="guardianAddress"
                                    name="guardianAddress"
                                    type="text"
                                    placeholder="Leave empty to use your current wallet"
                                    value={formData.guardianAddress}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                                    ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#0C3B5E] hover:bg-[#092b45]'} 
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B5E] transition-colors duration-200 mt-6`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        Processing...
                                    </span>
                                ) : (
                                    "Daftarkan Pasien"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}