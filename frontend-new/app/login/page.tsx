"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";

// Contract details
const CONTRACT_ADDRESS = "0xF9C608cD2E5Ae512C93C2597aC86764c99C9021C";
const CONTRACT_ABI = [
  "function getGuardianName(address guardian) view returns (string)",
];

export default function Login() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [defaultAccount, setDefaultAccount] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading state
  const router = useRouter();

  // This effect checks for an existing connection on page load
  useEffect(() => {
    const checkForExistingConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          // Use eth_accounts to check for existing permissions without prompting the user
          const accounts = await provider.send("eth_accounts", []);

          if (accounts.length > 0) {
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
              CONTRACT_ADDRESS,
              CONTRACT_ABI,
              signer
            );

            try {
              const guardianName = await contract.getGuardianName(accounts[0]);

              if (guardianName && guardianName.trim() !== "") {
                // If name is set, go to patient page
                router.push("/patient");
              } else {
                // If connected but no name, go to setup
                router.push("/setup");
              }
            } catch (e) {
              console.warn("Error fetching guardian name:", e);
            }
          } else {
            // If no accounts are authorized, show the login page
            setIsLoading(false);
          }
        } catch (err) {
          console.error("Error checking for connection:", err);
          setIsLoading(false); // Show login page on error
        }
      } else {
        // MetaMask not installed
        setIsLoading(false);
      }
    };

    checkForExistingConnection();
  }, [router]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        accountChangedHandler(accounts[0]);
        const signer = await provider.getSigner();
        const balance = await provider.getBalance(signer.getAddress());
        setUserBalance(ethers.formatEther(balance));
      } catch (err) {
        setErrorMessage("An error occurred while connecting.");
      }
    } else {
      setErrorMessage("Please install MetaMask to use this feature.");
    }
  };

  const accountChangedHandler = (newAccount: string) => {
    setDefaultAccount(newAccount);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (Array.isArray(accounts)) {
          accountChangedHandler(accounts[0]);
        }
      });
    }
  }, []);

  // This effect handles the redirect after a NEW connection
  useEffect(() => {
    if (defaultAccount) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      const redirectTimeout = setTimeout(() => {
        router.push("/setup");
      }, 5000);

      return () => {
        clearInterval(timer);
        clearTimeout(redirectTimeout);
      };
    }
  }, [defaultAccount, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100">
        <p className="text-lg font-semibold text-[#0C3B5E]">
          Checking wallet status...
        </p>
      </div>
    );
  }

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

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
          {/* Main Large Logo */}
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

      {/* Right Panel: Login Form */}
      <div className="w-full md:w-1/2 md:ml-[50%] min-h-screen flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="flex md:hidden flex-col items-center mb-8">
            <Image
              src="/logo.png"
              alt="B-Locate Logo"
              width={80} // Smaller size for mobile
              height={80}
            />
            <h2 className="text-2xl font-bold text-[#0C3B5E] mt-2">B-Locate</h2>
          </div>

          {/* Form Header (Desktop) */}
          <div className="hidden md:flex items-center justify-center gap-3 mb-8">
            <Image src="/logo.png" alt="B-Locate Logo" width={90} height={90} />
            <h2 className="text-3xl font-bold text-[#0C3B5E]">B-Locate</h2>
          </div>

          <div className="space-y-6 w-full">
            <h3 className="text-xl font-bold text-[#0C3B5E]">Masuk</h3>
            {defaultAccount ? (
              <div className="text-center">
                <p className="text-green-600 font-semibold">Wallet Connected!</p>
                <p className="text-sm text-gray-500 truncate">
                  Address: {defaultAccount}
                </p>
                {userBalance && (
                  <p className="text-sm text-gray-500">
                    Balance: {userBalance} ETH
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-4">
                  Redirecting to setup page in {countdown}s...
                </p>
              </div>
            ) : (
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  connectWallet();
                }}
              >
                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0C3B5E] hover:bg-[#092b45] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B5E] transition-colors duration-200"
                >
                  Connect to MetaMask
                </button>
              </form>
            )}
            {errorMessage && (
              <p className="text-red-500 text-sm text-center">
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
