"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";

// Contract details (same as in your main.js)
const CONTRACT_ADDRESS = "0xF9C608cD2E5Ae512C93C2597aC86764c99C9021C";
const CONTRACT_ABI = [
  "function setGuardianName(string name)",
  "function getGuardianName(address guardian) view returns (string)",
];

export default function Setup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const connectToWallet = async () => {
      if (!window.ethereum) {
        setStatusMessage("MetaMask is not installed. Redirecting...");
        timeoutId = setTimeout(() => router.push("/login"), 2000);
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const contractInstance = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
          );

          // Check if guardian name is already set
          try {
            const guardianName = await contractInstance.getGuardianName(
              accounts[0]
            );
            if (guardianName && guardianName.trim() !== "") {
              router.push("/patient"); // Redirect if name is set
              return;
            }
          } catch (e) {
            console.warn("Error fetching guardian name:", e);
          }

          setAccount(accounts[0]);
          setSigner(signer);
          setContract(contractInstance);
          setIsLoading(false);
        } else {
          setStatusMessage("No accounts found. Redirecting...");
          timeoutId = setTimeout(() => router.push("/login"), 2000);
        }
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        setStatusMessage(
          "Failed to connect. Please connect on the login page. Redirecting..."
        );
        timeoutId = setTimeout(() => router.push("/login"), 2000);
      }
    };

    connectToWallet();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contract || !signer) {
      setStatusMessage("Contract or wallet not connected properly.");
      return;
    }

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    if (!fullName) {
      setStatusMessage("Please enter a first and last name.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("Waiting for signature...");

    try {
      const tx = await contract.setGuardianName(fullName);
      setStatusMessage("Waiting for transaction confirmation...");
      await tx.wait();
      setStatusMessage(`Success! Your guardian name is set to "${fullName}".`);
      setFormData({ firstName: "", lastName: "" });
    } catch (error: any) {
      console.error("Error setting guardian name:", error);
      if (error.code === "ACTION_REJECTED") {
        setStatusMessage("Transaction was rejected by user.");
      } else {
        setStatusMessage("An error occurred during the transaction.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full">
      {/* Left Panel: Branding & Pattern */}
      <div className="h-screen hidden md:flex md:w-1/2 bg-[#02476D] fixed top-0 left-0 flex-col items-center justify-center p-12 overflow-hidden text-white z-10">
        <div className="absolute inset-0">
          <Image
            src="/bg_pattern.svg"
            alt="Background Pattern"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
          <Image
            src="/logo.png"
            alt="B-Locate Logo"
            width={250}
            height={250}
            priority
          />
          <h1 className="text-5xl font-bold tracking-tight mt-4">B-Locate</h1>
        </div>
      </div>

      {/* Right Panel: Signup Form */}
      <div className="w-full md:w-1/2 md:ml-[50%] min-h-screen flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div className="flex md:hidden flex-col items-center mb-8">
            <Image
              src="/logo.png"
              alt="B-Locate Logo"
              width={80}
              height={80}
            />
            <h2 className="text-2xl font-bold text-[#0C3B5E] mt-2">B-Locate</h2>
          </div>
          <div className="hidden md:flex items-center justify-center gap-3 mb-8">
            <Image src="/logo.png" alt="B-Locate Logo" width={90} height={90} />
            <h2 className="text-3xl font-bold text-[#0C3B5E]">B-Locate</h2>
          </div>

          <div>
            <h3 className="text-md font-medium text-[#0C3B5E] mb-2">
              Please input name to finish setup.
            </h3>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !account}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0C3B5E] hover:bg-[#092b45] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B5E] transition-colors duration-200 mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </form>
            {statusMessage && (
              <p className="mt-4 text-sm text-center text-gray-600">
                {statusMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
