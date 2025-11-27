"use client";

import Sidebar from "@/components/Sidebar";
import {
  ChartLine,
  ChevronRight,
  Droplets,
  File,
  Heart,
  History,
  Home,
  Info,
  MapPin,
  Thermometer,
  User,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function PatientDetailsPage() {
  const path = usePathname();
  const params = useParams();
  const router = useRouter();

  const id = params.id;
  console.log(id);

  const payload = {
    id: "2c8706fb-53c2-46e2-8467-9867024a648e",
    userId: "3c40209a-9a70-4f7b-9d03-b7bbfea52bd8",
    deviceId: "ID-1023912381023912",
    no: 1,

    img: "placeholder.svg",
    name: "Bryan Herdianto",
    disease: "Schizophrenia",
    birthplace: "Jakarta",
    birthdate: "12 November 2005",

    heartRate: 96,
    heartRateStatus: "Kritis",
    SpO2: 59,
    SpO2Status: "Prihatin",
    bodyTemperature: 36.5,
    bodyTemperatureStatus: "Normal",

    location: "Jakarta",
    distance: "12",
    distanceStatus: "Normal",
    recordedAt: "Hari ini, 12:00 WIB",
  };

  const llmPayload = {
    status: "Kritis",
    summary: "Heart Rate ada di kondisi yang sangat berbahaya",
    recommendation:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repellat laborum esse delectus labore nihil animi autem tempora quas nulla, quisquam saepe ex eos totam neque hic. Culpa maxime veniam ratione?",
  };

  // Payload
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(payload.name);
  const [birthplace, setBirthplace] = useState<string>(payload.birthplace);
  const [birthdate, setBirthdate] = useState<string>(payload.birthdate);
  const [disease, setDisease] = useState<string>(payload.disease);

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
        <div className="w-full overflow-auto flex flex-col space-y-6 h-full px-3 sm:px-12 py-7.5 bg-white rounded-2xl text-[#003552]">
          {/* Breadcrumb */}
          <div className="flex items-center text-base gap-2 font-medium">
            <Home />
            Home
            <ChevronRight />
            <History />
            History
            <ChevronRight />
            <File />
            {payload.id}
          </div>

          {/* Title */}
          <div>
            <h1 className="text-4xl font-semibold">Detail History </h1>
            <p>
              #{payload.no} {payload.name}
            </p>
            <p>{payload.recordedAt}</p>
          </div>

          {/* Information */}
          <h2 className="text-3xl font-semibold">Informasi Pasien</h2>

          {/* Health */}
          <div className="flex flex-col md:flex-row justify-around w-full text-center gap-4">
            {/* Heart Rate */}
            <div className="w-full md:w-1/3 flex flex-row md:flex-col items-center gap-3">
              <div className="p-2 md:p-4 rounded-2xl border-2 border-[#02476D] w-fit">
                <Heart className="size-8 md:size-14 text-red-500" />
              </div>
              <div className="flex flex-col justify-between">
                <div className="flex text-sm items-center gap-1 justify-center">
                  Heart Rate <Info className="size-4" />
                </div>
                <h1 className="text-2xl md:text-3xl font-semibold">
                  {payload.heartRate} <span className="text-xl">bpm</span>
                </h1>
                <div
                  className={`${
                    payload.heartRateStatus === "Kritis"
                      ? "bg-red-600"
                      : payload.heartRateStatus === "Prihatin"
                      ? "bg-[#FFDB43]"
                      : "bg-[#84EBB4]"
                  } text-black text-sm w-fit px-3 py-0.5 rounded-full mx-auto`}
                >
                  {payload.heartRateStatus}
                </div>
              </div>
            </div>

            {/* SpO2 Level */}
            <div className="w-full md:w-1/3 flex flex-row md:flex-col items-center gap-3">
              <div className="p-2 md:p-4 rounded-2xl border-2 border-[#02476D] w-fit">
                <Droplets className="size-8 md:size-14 text-blue-600" />
              </div>
              <div className="flex flex-col justify-between">
                <div className="flex text-sm items-center gap-1 justify-center">
                  <span>
                    SpO<sub>2</sub>
                  </span>{" "}
                  Level
                  <Info className="size-4" />
                </div>
                <h1 className="text-2xl md:text-3xl font-semibold">{payload.SpO2}%</h1>
                <div
                  className={`${
                    payload.SpO2Status === "Kritis"
                      ? "bg-red-600"
                      : payload.SpO2Status === "Prihatin"
                      ? "bg-[#FFDB43]"
                      : "bg-[#84EBB4]"
                  } text-black text-sm w-fit px-3 py-0.5 rounded-full mx-auto`}
                >
                  {payload.SpO2Status}
                </div>
              </div>
            </div>

            {/* Body Temperature */}
            <div className="w-full md:w-1/3 flex flex-row md:flex-col items-center gap-3">
              <div className="p-2 md:p-4 rounded-2xl border-2 border-[#02476D] w-fit">
                <Thermometer className="size-8 md:size-14 text-yellow-500" />
              </div>
              <div className="flex flex-col justify-between">
                <div className="flex text-sm items-center gap-1 justify-center">
                  BodyTemp <Info className="size-4" />
                </div>
                <h1 className="text-2xl md:text-3xl font-semibold">
                  {payload.bodyTemperature} <span className="text-xl">°C</span>
                </h1>
                <div
                  className={`${
                    payload.bodyTemperatureStatus === "Kritis"
                      ? "bg-red-600"
                      : payload.bodyTemperatureStatus === "Prihatin"
                      ? "bg-[#FFDB43]"
                      : "bg-[#84EBB4]"
                  } text-black text-sm w-fit px-3 py-0.5 rounded-full mx-auto`}
                >
                  {payload.bodyTemperatureStatus}
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4 p-5 border-2 border-[#02476D] rounded-2xl">
            <div className="flex w-full items-center justify-between">
              <div className="flex gap-2 text-xl font-semibold">
                <MapPin />
                Lokasi Pasien
              </div>

              <div className="flex gap-2 items-center">
                {payload.distance} m
                <div
                  className={`${
                    payload.distanceStatus === "Kritis"
                      ? "bg-red-600"
                      : payload.distanceStatus === "Prihatin"
                      ? "bg-[#FFDB43]"
                      : "bg-[#84EBB4]"
                  } text-black text-sm w-fit px-3 py-0.5 rounded-full`}
                >
                  {payload.distanceStatus}
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-lg h-64 md:h-96 border-2 border-[#02476D]"></div>

            {/* Stats */}
            <div className="w-full flex flex-col md:flex-row gap-6">
              {/* Location Name */}
              <div className="w-full">
                <label className="text-sm">Alamat Lokasi</label>
                <div className="h-12 flex items-center border border-[#02476D] rounded-xl px-4 font-medium bg-[#E8E8E8] placeholder:text-[#8E8E8E] w-full focus:outline-[#02476D] relative">
                  {payload.location}
                </div>
              </div>

              {/* Distance */}
              <div className="w-full">
                <label className="text-sm">Jarak dari Checkpoint</label>
                <div className="h-12 flex items-center border border-[#02476D] rounded-xl px-4 font-medium bg-[#E8E8E8] placeholder:text-[#8E8E8E] w-full focus:outline-[#02476D] relative">
                  {payload.distance} m
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="w-full">
              <label className="text-sm">Status</label>
              <div className="h-12 flex items-center border border-[#02476D] rounded-xl px-4 font-medium bg-[#E8E8E8] placeholder:text-[#8E8E8E] w-full focus:outline-[#02476D] relative">
                {payload.distanceStatus}
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="space-y-4 p-5 border-2 border-[#02476D] rounded-2xl">
            <div className="flex gap-2 text-xl font-semibold">
              <ChartLine />
              AI Summary
            </div>

            {/* Summary */}
            <div className="flex items-center gap-4 text-black font-semibold">
              <div
                className={`${
                  llmPayload.status === "Kritis"
                    ? "bg-red-600"
                    : llmPayload.status === "Prihatin"
                    ? "bg-[#FFDB43]"
                    : "bg-[#84EBB4]"
                } text-black text-2xl w-fit px-4 py-2 rounded-xl font-semibold`}
              >
                {llmPayload.status}
              </div>
              {llmPayload.summary}
            </div>

            {/* Recommendation */}
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Health Data */}
              <div className="flex flex-col justify-center w-full sm:w-2/5 space-y-6">
                {/* Heart Rate */}
                <div className="font-semibold flex gap-3 w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl border-2 border-[#02476D] w-fit">
                      <Heart className="size-6 text-red-500" />
                    </div>
                    Heart Rate
                  </div>
                  <div className="flex flex-col justify-between">
                    <div
                      className={`${
                        payload.heartRateStatus === "Kritis"
                          ? "bg-red-600"
                          : payload.heartRateStatus === "Prihatin"
                          ? "bg-[#FFDB43]"
                          : "bg-[#84EBB4]"
                      } text-black text-sm w-fit px-3 py-0.5 rounded-full`}
                    >
                      {payload.heartRateStatus}
                    </div>
                  </div>
                </div>

                {/* SpO2 Level */}
                <div className="font-semibold flex gap-3 w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl border-2 border-[#02476D] w-fit">
                      <Droplets className="size-6 text-blue-600" />
                    </div>
                    <span>
                      SpO<sub>2</sub> Level
                    </span>
                  </div>
                  <div className="flex flex-col justify-between">
                    <div
                      className={`${
                        payload.SpO2Status === "Kritis"
                          ? "bg-red-600"
                          : payload.SpO2Status === "Prihatin"
                          ? "bg-[#FFDB43]"
                          : "bg-[#84EBB4]"
                      } text-black text-sm w-fit px-3 py-0.5 rounded-full`}
                    >
                      {payload.SpO2Status}
                    </div>
                  </div>
                </div>

                {/* Body Temperature */}
                <div className="font-semibold flex gap-3 w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl border-2 border-[#02476D] w-fit">
                      <Thermometer className="size-6 text-yellow-500" />
                    </div>
                    Body Temp
                  </div>
                  <div className="flex flex-col justify-between">
                    <div
                      className={`${
                        payload.bodyTemperatureStatus === "Kritis"
                          ? "bg-red-600"
                          : payload.bodyTemperatureStatus === "Prihatin"
                          ? "bg-[#FFDB43]"
                          : "bg-[#84EBB4]"
                      } text-black text-sm w-fit px-3 py-0.5 rounded-full`}
                    >
                      {payload.bodyTemperatureStatus}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="flex overflow-auto border border-[#02476D] rounded-xl py-2 px-4 font-medium bg-[#E8E8E8] placeholder:text-[#8E8E8E] w-full focus:outline-[#02476D] relative">
                {llmPayload.recommendation}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => router.push(`/patient/${payload.userId}`)}
              type="button"
              className="w-fit text-xs sm:text-md flex items-center gap-1 sm:gap-3 justify-center py-3 px-2 sm:px-4 border border-transparent rounded-xl shadow-sm text-white bg-[#02476D] font-medium hover:bg-[#023c5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B5E] transition-colors duration-200"
            >
              Lihat Profil Pasien <User />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
