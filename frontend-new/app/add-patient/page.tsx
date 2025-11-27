"use client";

import Sidebar from "@/components/Sidebar";
import { CirclePlus, Home, Menu, X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AddPatientPage() {
  const path = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-full flex bg-[#02476D] font-sans">
      {/* Left Panel */}
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

      {/* Right Panel */}
      <div className="w-full md:w-3/4 flex flex-col p-4">
        <div className="w-full flex flex-col space-y-6 h-full px-4 sm:px-12 py-7.5 bg-white rounded-2xl text-[#003552] overflow-hidden relative">
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
          {/* Breadcrumb */}
          <div className="flex items-center text-base gap-2 font-medium">
            <Home />
            Home
          </div>

          {/* Title */}
          <h1 className="text-4xl font-semibold">Tambah Pasien</h1>

          {/* Form */}
          <form className="flex-1 flex flex-col gap-4 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nama
                </label>
                <input
                  type="text"
                  id="name"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#02476D] focus:border-[#02476D] sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-gray-700"
                >
                  Umur
                </label>
                <input
                  type="number"
                  id="age"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#02476D] focus:border-[#02476D] sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="disease"
                  className="block text-sm font-medium text-gray-700"
                >
                  Penyakit
                </label>
                <input
                  type="text"
                  id="disease"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#02476D] focus:border-[#02476D] sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="device-id"
                  className="block text-sm font-medium text-gray-700"
                >
                  ID Device
                </label>
                <input
                  type="text"
                  id="device-id"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#02476D] focus:border-[#02476D] sm:text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-3 justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-white bg-[#02476D] font-medium hover:bg-[#023c5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B5E] transition-colors duration-200"
              >
                Tambah
                <CirclePlus />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
