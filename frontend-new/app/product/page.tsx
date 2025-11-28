"use client";

import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function ProductPage() {
  const path = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full flex bg-[#02476D] font-sans">
      {/* Left Panel: Branding & Pattern (Hidden on mobile, visible on medium screens and up) */}
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

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#02476D] flex flex-col items-center justify-center p-4 text-white">
          <div className="absolute inset-0 z-0">
            <Image
              src="/bg_pattern.svg"
              alt="Background Pattern"
              fill
              className="object-cover"
              priority
            />
          </div>
          <Sidebar path={path} />
        </div>
      )}

      {/* Right Panel: Signup Form */}
      <div className="py-4 pr-4 w-full md:w-3/4">
        <div className="flex items-center justify-center w-full h-full p-6 bg-white rounded-2xl relative">
          {/* Hamburger Menu Button */}
          <div className="md:hidden absolute top-6 left-6 z-50">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? (
                <X className="h-8 w-8 text-white" />
              ) : (
                <Menu className="h-8 w-8 text-[#02476D]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
