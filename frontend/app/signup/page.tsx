"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <div className="min-h-screen w-full flex bg-[#02476D] font-sans">
      {/* Left Panel: Branding & Pattern (Hidden on mobile, visible on medium screens and up) */}
      <div className="hidden md:flex md:w-1/2 bg-[#02476D] relative flex-col items-center justify-center p-12 text-white">
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
      <div className="py-4 pr-4 w-full md:w-1/2">
        <div className="flex items-center justify-center w-full h-full p-6 bg-white rounded-2xl">
          <div className="w-full max-w-md space-y-6">
            {/* Mobile Logo (Visible only on small screens) */}
            <div className="flex md:hidden flex-col items-center mb-8">
              <Image
                src="/logo.png"
                alt="B-Locate Logo"
                width={80} // Smaller size for mobile
                height={80}
              />
              <h2 className="text-2xl font-bold text-[#0C3B5E] mt-2">
                B-Locate
              </h2>
            </div>

            {/* Form Header (Desktop) */}
            <div className="hidden md:flex items-center justify-center gap-3 mb-8">
              <Image
                src="/logo.png"
                alt="B-Locate Logo"
                width={90}
                height={90}
              />
              <h2 className="text-3xl font-bold text-[#0C3B5E]">B-Locate</h2>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#0C3B5E] mb-6">Daftar</h3>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {/* Name Fields Row */}
                <div className="flex gap-4">
                  <div className="w-1/2 space-y-2">
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nama Awal
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
                  <div className="w-1/2 space-y-2">
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nama Akhir
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
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent outline-none transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Enter your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent outline-none transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Link to Login */}
                <div className="flex items-center justify-end mt-2 text-sm">
                  <span className="mr-1">Sudah Punya Akun?</span>
                  <a href="#" className="underline">
                    Masuk
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0C3B5E] hover:bg-[#092b45] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B5E] transition-colors duration-200 mt-6"
                >
                  Daftar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
