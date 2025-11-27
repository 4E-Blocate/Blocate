"use client";

import { useState } from "react";
import Image from "next/image";

export default function Setup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

      {/* Right Panel: Signup Form */}
      <div className="w-full md:w-1/2 md:ml-[50%] min-h-screen flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md space-y-6">
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

          <div>
            <h3 className="text-md font-medium text-[#0C3B5E] mb-6">You have connected to MetaMask, now please input name to finish setup.</h3>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {/* First Name Input (Single Column) */}
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

              {/* Last Name Input (Single Column) */}
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

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0C3B5E] hover:bg-[#092b45] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B5E] transition-colors duration-200 mt-6"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
