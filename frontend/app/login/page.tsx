"use client";

import { useState } from "react";
import Image from "next/image";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

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

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0C3B5E] hover:bg-[#092b45] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B5E] transition-colors duration-200"
              >
                Connect to MetaMask
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
