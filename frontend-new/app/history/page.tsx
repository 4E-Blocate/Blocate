"use client";

import Sidebar from "@/components/Sidebar";
import {
  ArrowRight,
  CirclePlus,
  Droplets,
  Heart,
  Home,
  Info,
  MapPin,
  Search,
  Thermometer,
  User,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HistoryPage() {
  const path = usePathname();
  const router = useRouter();

  const payload = [
    {
      id: "2c8706fb-53c2-46e2-8467-9867024a648e",
      userId: "3c40209a-9a70-4f7b-9d03-b7bbfea52bd8",
      no: 1,
      img: "placeholder.svg",
      name: "Bryan Herdianto",
      disease: "Schizophrenia",
      age: 21,
      distance: 12,
      status: "Kritis",
      date: "12 November 2025, 10:00 WIB",
      summary: "Heart Rate ada di kondisi yang sangat berbahaya",
      heartRate: 96,
      spo2: 59,
      temperature: 36.5,
    },
    {
      id: "3251acc0-1686-408b-8cb2-986a54bd951b",
      userId: "3251acc0-1686-408b-8cb2-986a54bd951b",
      no: 2,
      img: "placeholder.svg",
      name: "Hakim Nizami",
      disease: "Alzheimer",
      age: 21,
      distance: 50,
      status: "Prihatin",
      date: "12 November 2025, 11:00 WIB",
      summary: "Saturasi Oksigen sedikit dibawah normal",
      heartRate: 80,
      spo2: 92,
      temperature: 37.0,
    },
    {
      id: "04aade17-bc77-4f8b-9d4a-554ca6569e4a",
      userId: "04aade17-bc77-4f8b-9d4a-554ca6569e4a",
      no: 3,
      img: "placeholder.svg",
      name: "Nadzhif Fikri",
      disease: "Dementia",
      age: 21,
      distance: 32,
      status: "Aman",
      date: "12 November 2025, 12:00 WIB",
      summary: "Kondisi pasien stabil",
      heartRate: 75,
      spo2: 98,
      temperature: 36.8,
    },
    {
      id: "4f3c006d-51b1-47fb-b3f7-e0c4fa5212af",
      userId: "4f3c006d-51b1-47fb-b3f7-e0c4fa5212af",
      no: 4,
      img: "placeholder.svg",
      name: "Andi Alvin",
      disease: "Autism",
      age: 21,
      distance: 322,
      status: "Kritis",
      date: "12 November 2025, 13:00 WIB",
      summary: "Suhu tubuh sangat tinggi, pasien demam",
      heartRate: 105,
      spo2: 95,
      temperature: 39.5,
    },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPayload, setFilteredPayload] = useState(payload);

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = payload.filter(
      (data) =>
        data.name.toLowerCase().includes(lowercasedQuery) ||
        data.disease.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredPayload(filtered);
  }, [searchQuery]);

  return (
    <div className="h-screen w-full flex bg-[#02476D] font-sans">
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

      {/* Right Panel: Patients */}
      <div className="w-full md:w-3/4 flex flex-col">
        <div className="w-full flex flex-col space-y-6 h-full px-4 sm:px-12 py-7.5 bg-white rounded-2xl text-[#003552] overflow-hidden">
          {/* Breadcrumb */}
          <div className="flex items-center text-base gap-2 font-medium">
            <Home />
            Home
          </div>

          {/* Title */}
          <h1 className="text-4xl font-semibold">Pasien</h1>

          {/* Search */}
          <div className="flex gap-4">
            <div className="w-full relative">
              <input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-[#333333] rounded-xl px-4 h-full font-medium bg-[#E8E8E8] placeholder:text-[#8E8E8E] w-full focus:outline-[#02476D]"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="button"
              className="flex items-center gap-3 justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-[#02476D] font-medium hover:bg-[#023c5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B5E] transition-colors duration-200"
            >
              Tambah
              <CirclePlus />
            </button>
          </div>

          {/* List of History */}
          <div className="flex-1 text-white space-y-6 overflow-auto">
            {filteredPayload.map((data, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 border-4 relative border-[#003552] bg-[#115276] rounded-3xl py-3 px-5"
              >
                {/* Patient and Date */}
                <div className="flex justify-between items-center w-full z-10">
                  <div className="hidden sm:block text-xl font-medium top-4 left-4">
                    #{data.no} {data.name}
                  </div>
                  <div>{data.date}</div>
                </div>

                {/* Status */}
                <div
                  className={`${
                    data.status === "Kritis"
                      ? "bg-red-600 text-white"
                      : data.status === "Prihatin"
                      ? "bg-[#FFDB43] text-[#003552]"
                      : "bg-[#84EBB4] text-[#003552]"
                  } text-2xl w-fit px-4 py-2 rounded-xl font-semibold z-10`}
                >
                  {data.status}
                </div>

                {/* Summary */}
                <div className="border-2 border-[#16929C] bg-[#E8E8E8] px-5 py-2 rounded-xl max-w-1/2 text-black z-10">
                  {data.summary}
                </div>
                <div className="flex max-w-1/2 z-10">
                  {/* Heart Rate */}
                  <div className="w-1/3 flex max-lg:flex-col items-center gap-3">
                    <div className="p-2 rounded-2xl border-2 border-[#16929C] bg-white w-fit">
                      <Heart className="size-6 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-medium">
                      {data.heartRate} bpm
                    </h1>
                  </div>

                  {/* SpO2 Level */}
                  <div className="w-1/3 flex max-lg:flex-col items-center gap-3">
                    <div className="p-2 rounded-2xl border-2 border-[#16929C] bg-white w-fit">
                      <Droplets className="size-6 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-medium">{data.spo2}%</h1>
                  </div>

                  {/* Body Temperature */}
                  <div className="w-1/3 flex max-lg:flex-col items-center gap-3">
                    <div className="p-2 rounded-2xl border-2 border-[#16929C] bg-white w-fit">
                      <Thermometer className="size-6 text-yellow-500" />
                    </div>
                    <h1 className="text-2xl font-medium">
                      {data.temperature} °C
                    </h1>
                  </div>
                </div>

                {/* Distance + Buttons*/}
                <div className="flex items-center justify-between z-10">
                  <p className="text-2xl">Jarak: {data.distance} m</p>
                  <div className="flex gap-4">
                    {/* Profile */}
                    <button
                      type="button"
                      onClick={() => router.push(`/patient/${data.userId}`)}
                      className="flex text-sm items-center gap-2 justify-center py-3 mt-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-[#16929C] font-medium hover:bg-[#0e7880] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B5E] transition-colors duration-200"
                    >
                      Profil Pasien
                      <User />
                    </button>

                    {/* Details */}
                    <button
                      type="button"
                      onClick={() => router.push(`/history/${data.id}`)}
                      className="flex text-sm items-center gap-2 justify-center py-3 mt-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-[#16929C] font-medium hover:bg-[#0e7880] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B5E] transition-colors duration-200"
                    >
                      Detail
                      <Info />
                    </button>
                  </div>
                </div>

                {/* Decorative Element */}
                <div className="absolute h-full right-0 top-0 z-0">
                  <Image
                    src="card_element.svg"
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
