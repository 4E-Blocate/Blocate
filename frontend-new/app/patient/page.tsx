"use client";

import Sidebar from "@/components/Sidebar";
import { ArrowRight, CirclePlus, Home, MapPin, Search } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PatientPage() {
  const path = usePathname();
  const router = useRouter();

  const payload = [
    {
      id: "3c40209a-9a70-4f7b-9d03-b7bbfea52bd8",
      no: 1,
      img: "placeholder.svg",
      name: "Bryan Herdianto",
      disease: "Schizophrenia",
      age: 21,
      distance: 12,
    },
    {
      id: "3251acc0-1686-408b-8cb2-986a54bd951b",
      no: 2,
      img: "placeholder.svg",
      name: "Hakim Nizami",
      disease: "Alzheimer",
      age: 21,
      distance: 50,
    },
    {
      id: "04aade17-bc77-4f8b-9d4a-554ca6569e4a",
      no: 3,
      img: "placeholder.svg",
      name: "Nadzhif Fikri",
      disease: "Dementia",
      age: 21,
      distance: 32,
    },
    {
      id: "4f3c006d-51b1-47fb-b3f7-e0c4fa5212af",
      no: 4,
      img: "placeholder.svg",
      name: "Andi Alvin",
      disease: "Autism",
      age: 21,
      distance: 322,
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

          {/* List of Patients */}
          <div className="flex-1 text-white space-y-6 overflow-auto">
            {filteredPayload.map((data, index) => (
              <div
                key={index}
                className="flex gap-6 border-4 relative border-[#003552] bg-[#115276] rounded-3xl py-3 sm:py-5 px-3 sm:px-12"
              >
                {/* Number */}
                <div className="hidden sm:block text-xl font-medium absolute top-4 left-4">
                  #{data.no}
                </div>

                {/* Picture */}
                <div className="hidden sm:block relative size-25 z-10 overflow-hidden rounded-full">
                  <Image src={data.img} alt="profile" fill />
                </div>

                {/* Data */}
                <div className="flex-1 flex flex-col justify-between z-10">
                  <div>
                    <h1 className="text-xl sm:text-3xl font-semibold">{data.name}</h1>
                    <p>{data.age} y.o</p>
                  </div>
                  <p>{data.disease}</p>
                </div>

                {/* Additional */}
                <div className="flex flex-col items-end justify-between z-10">
                  {/* Distance */}
                  <div className="w-fit flex gap-2 items-center rounded-xl font-semibold bg-white py-1.5 px-3 text-">
                    <span className="text-[#1FC16B]">{data.distance} m</span>
                    <MapPin className="text-[#003552]" />
                  </div>

                  {/* Details */}
                  <button
                    type="button"
                    onClick={() => router.push(`/patient/${data.id}`)}
                    className="flex text-sm items-center justify-center py-3 mt-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-[#16929C] font-medium hover:bg-[#0e7880] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B5E] transition-colors duration-200"
                  >
                    Lihat Detail
                    <ArrowRight />
                  </button>
                </div>

                {/* Decorative Element */}
                <div className="absolute h-full right-0 top-0">
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
