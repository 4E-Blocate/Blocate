"use client";

import Sidebar from "@/components/Sidebar";
import {
  ChartLine,
  ChevronRight,
  Droplets,
  Heart,
  History,
  Home,
  Info,
  MapPin,
  Pen,
  RefreshCcw,
  Save,
  SquarePen,
  Thermometer,
  Trash2,
  User,
  Users,
  Loader2 // Added for loading state
} from "lucide-react";
import Image from "next/image";
import { usePathname, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ethers } from 'ethers'; // Added ethers

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

// --- CONFIGURATION ---
const CONFIG = {
  CONTRACT_ADDRESS: "0x717CD91f1C0897CEc98e3e1F85d3Cd6FE7D73C4B",
  OLLAMA_API: "http://localhost:11434/api/generate", // Local Ollama endpoint
  OLLAMA_MODEL: "llama3.2:3b"
};

const CONTRACT_ABI = [
  "function getDevice(string deviceId) view returns (tuple(string deviceId, address patient, address guardian, string fullName, uint8 age, string homeLocation, bool isActive, uint256 registeredAt))",
];

export default function PatientDetailsPage() {
  const path = usePathname();
  const params = useParams();
  const id = params.id as string; // This is the Device ID from URL

  // --- STATIC SENSOR & AI DATA (JANGAN DIOTAK-ATIK / DO NOT TOUCH) ---
  const payload = {
    id: "3c40209a-9a70-4f7b-9d03-b7bbfea52bd8",
    no: 1,
    img: "placeholder.svg",
    // These profile defaults will be overwritten by Blockchain data in the UI
    defaultName: "Loading...",

    // Sensor Data (Preserved)
    heartRate: 96,
    heartRateStatus: "Kritis",
    SpO2: 59,
    SpO2Status: "Prihatin",
    bodyTemperature: 36.5,
    bodyTemperatureStatus: "Normal",
    distance: "12",
    distanceStatus: "Normal",
    lastUpdated: "Hari ini, 12:00 WIB",
  };

  const llmPayload = {
    status: "Kritis",
    summary: "Heart Rate ada di kondisi yang sangat berbahaya",
    recommendation:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repellat laborum esse delectus labore nihil animi autem tempora quas nulla, quisquam saepe ex eos totam neque hic. Culpa maxime veniam ratione?",
  };

  // --- DYNAMIC STATE FOR PROFILE FIELDS ---
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Profile Fields (Managed Data)
  const [name, setName] = useState<string>("");
  const [birthplace, setBirthplace] = useState<string>(""); // Mapping to Home Location
  const [birthdate, setBirthdate] = useState<string>("");   // Mapping to Age
  const [disease, setDisease] = useState<string>("Dementia");
  const [deviceId, setDeviceId] = useState<string>(id);

  // --- AI STATE (Ollama Integration) ---
  const [aiRecommendation, setAiRecommendation] = useState<string>(
    "Klik tombol 'AI Analyze' untuk mendapatkan rekomendasi medis dari Ollama..."
  );
  const [aiStatus, setAiStatus] = useState<string>("Normal");
  const [aiSummary, setAiSummary] = useState<string>("Menunggu Analisa...");
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);

  // --- FETCH DATA FROM BLOCKCHAIN ---
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!window.ethereum) return;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        console.log("Fetching data for device:", id);
        const data = await contract.getDevice(id);

        // Update State with Blockchain Data
        setName(data.fullName);
        setBirthdate(`${data.age} Tahun`); // Contract only has Age
        setBirthplace(data.homeLocation); // Contract has Home Location
        setDeviceId(data.deviceId);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching patient data:", error);
        setName("Error Loading Data");
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const generateAIAnalysis = async () => {
    if (isGeneratingAI) return;
    setIsGeneratingAI(true);
    setAiRecommendation(""); // Clear previous text to start streaming effect
    setAiStatus("Analyzing...");
    setAiSummary("Ollama is thinking...");

    // 1. Construct the prompt based on current Patient Data
    const prompt = `
      Analyze this patient data:
      Patient: ${name} (Age: ${birthdate})
      Condition: ${disease}
      
      Vitals:
      - Heart Rate: ${payload.heartRate} bpm (${payload.heartRateStatus})
      - SpO2: ${payload.SpO2}% (${payload.SpO2Status})
      - Temperature: ${payload.bodyTemperature}°C (${payload.bodyTemperatureStatus})
      
      Provide a concise medical recommendation (MAXIMUM 2 SENTENCES) focusing on the immediate next steps for the guardian. Do not use markdown.
    `;

    try {
      // 2. Fetch from local Ollama instance
      const response = await fetch(CONFIG.OLLAMA_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: CONFIG.OLLAMA_MODEL,
          prompt: prompt,
          stream: true // Enable streaming
        })
      });

      if (!response.body) throw new Error("No response body");

      // 3. Setup Reader for Streaming
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      // 4. Read Loop
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Ollama sends multiple JSON objects in one chunk sometimes, split by newline
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                fullResponse += data.response;
                // Update UI in real-time
                setAiRecommendation((prev) => prev + data.response);
              }
              if (data.done) {
                // Finalize static status/summary based on vital logic (since streaming JSON is risky)
                setAiStatus("Selesai");
                setAiSummary("Analisa AI Selesai");
              }
            } catch (e) {
              console.error("JSON Parse Error", e);
            }
          }
        }
      }

    } catch (error) {
      console.error("Ollama Connection Error:", error);
      setAiRecommendation("Gagal terhubung ke Ollama. Pastikan 'ollama serve' berjalan dan CORS diizinkan (OLLAMA_ORIGINS='*').");
      setAiStatus("Error");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // --- AUTO RUN AI ON DATA LOAD ---
  useEffect(() => {
    if (name) {
      generateAIAnalysis();
    }
  }, [name]);

  return (
    <div className="h-screen w-full flex bg-[#02476D] font-sans">
      {/* Left Panel: Branding & Pattern */}
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

      {/* Right Panel: Patients */}
      <div className="w-full md:w-3/4 flex flex-col">
        <div className="w-full overflow-auto flex flex-col space-y-6 h-full px-3 sm:px-12 py-7.5 bg-white rounded-2xl text-[#003552]">
          {/* Breadcrumb */}
          <div className="flex items-center text-base gap-2 font-medium">
            <Home />
            Home
            <ChevronRight />
            <Users />
            Pasien
            <ChevronRight />
            <User />
            {/* Dynamic Name in Breadcrumb */}
            {isLoading ? "..." : name}
          </div>

          {/* Title */}
          <div>
            <h1 className="text-4xl font-semibold">
              {/* Dynamic Name in Title */}
              {isLoading ? "Memuat Data..." : name}
            </h1>
            {/* Dynamic Device ID */}
            <p>ID Device: {deviceId}</p>
          </div>

          {/* Profile */}
          <div className="flex justify-between">
            <h2 className="text-3xl font-semibold">Profil</h2>
            <button className="cursor-pointer flex items-center gap-2 font-medium text-red-500">
              <Trash2 />
              Hapus Pasien
            </button>
          </div>

          {/* Form Fields - Connected to State */}
          <div>
            <label className="text-sm">Nama Lengkap Pasien</label>
            <div className="h-12 relative">
              <input
                placeholder="Isi Nama..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-full border border-[#02476D] rounded-xl px-4 font-medium bg-[#E8E8E8] placeholder:text-[#8E8E8E] w-full focus:outline-[#02476D]"
                disabled={!isEditing}
              />
              {isEditing && (
                <Pen className="absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
          </div>

          <div className="w-full flex flex-col md:flex-row gap-6">
            <div className="w-full">
              <label className="text-sm">Lokasi Rumah (Birthplace)</label>
              <div className="h-12 relative">
                <input
                  placeholder="Isi Tempat Lahir..."
                  value={birthplace}
                  onChange={(e) => setBirthplace(e.target.value)}
                  className="h-full border border-[#02476D] rounded-xl px-4 font-medium bg-[#E8E8E8] placeholder:text-[#8E8E8E] w-full focus:outline-[#02476D]"
                  disabled={!isEditing}
                />
                {isEditing && (
                  <Pen className="absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>

            <div className="w-full">
              <label className="text-sm">Umur (Age)</label>
              <div className="h-12 relative">
                <input
                  placeholder="Isi Umur..."
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="h-full border border-[#02476D] rounded-xl px-4 font-medium bg-[#E8E8E8] placeholder:text-[#8E8E8E] w-full focus:outline-[#02476D]"
                  disabled={!isEditing}
                />
                {isEditing && (
                  <Pen className="absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm">Penyakit</label>
            <div className="h-12 relative">
              <input
                placeholder="Isi Penyakit..."
                value={disease}
                onChange={(e) => setDisease(e.target.value)}
                className="h-full border border-[#02476D] rounded-xl px-4 font-medium bg-[#E8E8E8] placeholder:text-[#8E8E8E] w-full focus:outline-[#02476D]"
                disabled={!isEditing}
              />
              {isEditing && (
                <Pen className="absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
          </div>

          {/* Edit Button */}
          <div className="w-full flex justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="w-fit flex items-center gap-3 justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-[#02476D] font-medium hover:bg-[#023c5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B5E] transition-colors duration-200"
            >
              {isEditing ? (
                <>
                  Simpan
                  <Save />
                </>
              ) : (
                <>
                  Edit
                  <SquarePen />
                </>
              )}
            </button>
          </div>

          <h2 className="text-3xl font-semibold">Informasi Pasien</h2>
          <div className="flex flex-col justify-around w-full text-center gap-4">
            <div className="flex flex-col md:flex-row justify-around w-full text-center gap-4">
              {/* Heart Rate */}
              <div className="w-full md:w-1/3 flex md:flex-row flex-col items-center gap-3">
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
                    className={`${payload.heartRateStatus === "Kritis"
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
              <div className="w-full md:w-1/3 flex md:flex-row flex-col items-center gap-3">
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
                  <h1 className="text-2xl md:text-3xl font-semibold">
                    {payload.SpO2}%
                  </h1>
                  <div
                    className={`${payload.SpO2Status === "Kritis"
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
              <div className="w-full md:w-1/3 flex md:flex-row flex-col items-center gap-3">
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
                    className={`${payload.bodyTemperatureStatus === "Kritis"
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
                    className={`${payload.distanceStatus === "Kritis"
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
              <Map lat={-7.250445} lng={112.768845} />

              {/* Stats */}
              <div className="w-full flex gap-6">
                {/* Location Name - Using Dynamic Profile Location */}
                <div className="w-full">
                  <label className="text-sm">Alamat Lokasi</label>
                  <div className="h-12 flex items-center border border-[#02476D] rounded-xl px-4 font-medium bg-[#E8E8E8] placeholder:text-[#8E8E8E] w-full focus:outline-[#02476D] relative">
                    {/* Using fetch birthplace/location here instead of static */}
                    {birthplace || "Loading..."}
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

              <div className="w-full flex flex-col md:flex-row gap-6">
                {/* Status */}
                <div className="w-full">
                  <label className="text-sm">Status</label>
                  <div className="h-12 flex items-center border border-[#02476D] rounded-xl px-4 font-medium bg-[#E8E8E8] placeholder:text-[#8E8E8E] w-full focus:outline-[#02476D] relative">
                    {payload.distanceStatus}
                  </div>
                </div>

                {/* Last Updated */}
                <div className="w-full">
                  <label className="text-sm">Terakhir Diupdate</label>
                  <div className="h-12 flex items-center border border-[#02476D] rounded-xl px-4 font-medium bg-[#E8E8E8] placeholder:text-[#8E8E8E] w-full focus:outline-[#02476D] relative">
                    {payload.lastUpdated}
                  </div>
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
              <div className="flex flex-col md:flex-row items-center gap-4 text-black font-semibold">
                <div
                  className={`${llmPayload.status === "Kritis"
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
                        className={`${payload.heartRateStatus === "Kritis"
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
                        className={`${payload.SpO2Status === "Kritis"
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
                        className={`${payload.bodyTemperatureStatus === "Kritis"
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
                <div className="flex-1 border border-[#02476D] rounded-xl py-3 px-4 font-medium bg-[#E8E8E8] text-[#003552] w-full min-h-[100px] shadow-inner">
                  {/* This is where the stream appears */}
                  <p className="whitespace-pre-wrap leading-relaxed text-left">
                    {aiRecommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col md:flex-row justify-end gap-3">
              <button
                type="button"
                className="w-full md:w-fit text-xs sm:text-md flex items-center gap-1 sm:gap-3 justify-center py-3 px-2 sm:px-4 border border-transparent rounded-xl shadow-sm text-white bg-[#02476D] font-medium hover:bg-[#023c5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B5E] transition-colors duration-200"
              >
                Update <RefreshCcw />
              </button>
              <button
                type="button"
                className="w-full md:w-fit text-xs sm:text-md flex items-center gap-1 sm:gap-3 justify-center py-3 px-2 sm:px-4 border border-transparent rounded-xl shadow-sm text-white bg-[#02476D] font-medium hover:bg-[#023c5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B5E] transition-colors duration-200"
              >
                Simpan <Save />
              </button>
              <button
                type="button"
                className="w-full md:w-fit text-xs sm:text-md flex items-center gap-1 sm:gap-3 justify-center py-3 px-2 sm:px-4 border border-transparent rounded-xl shadow-sm text-white bg-[#02476D] font-medium hover:bg-[#023c5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C3B5E] transition-colors duration-200"
              >
                Lihat History <History />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}