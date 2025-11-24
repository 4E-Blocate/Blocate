# 🏥🩺 BLocate: Decentralized Health Monitoring

A truly decentralized health monitoring system: ESP32 IoT sensors, blockchain, and a modern dashboard. Eliminates single points of failure and enables permissionless deployment.

---

## 🚀 Project Overview

**BLocate** enables real-time monitoring of patient vitals (heart rate, temperature, GPS location) through a fully decentralized architecture:

- ✅ Real-time Monitoring (IoT sensors)
- ✅ Smart Geofencing (auto alerts)
- ✅ AI Health Interpretation (Gemini AI)
- ✅ Immutable Blockchain Verification
- ✅ Decentralized Storage (GunDB)
- ✅ Guardian Alerts
- ✅ Modern Frontend Dashboard

---

## 🛠️ Technologies Used

**Backend:**

- Node.js (ES Modules)
- Solidity 0.8.20 (Smart Contracts)
- Hardhat
- ethers.js v6
- GunDB
- MQTT.js
- Google Gemini AI

**Frontend:**

- Next.js (React)
- TypeScript
- Tailwind CSS
- Ethers.js
- GunDB

---

## 🏗️ Architecture

![picture 0](https://i.imgur.com/Mj2zeHv.png)  

![picture 2](https://i.imgur.com/ZvZmli8.png)  

No REST API required — frontend reads directly from blockchain + GunDB!

---

## 👤 User Flow

![picture 1](https://i.imgur.com/vAbo7eK.png)  

---

## 📋 5 Langkah Menjalankan Repository

### 1️⃣ Install Dependencies Backend & Frontend

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2️⃣ Konfigurasi Environment Backend

```bash
cd ../backend
cp .env.example .env

# Edit .env dengan data berikut:

# NODE_ID=patient-guardian-node-1
# NODE_ENV=development

# MQTT_BROKER=mqtt://localhost:1883
# MQTT_USERNAME=
# MQTT_PASSWORD=

# TON_RPC=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
# TON_PRIVATE_KEY=your_wallet_private_key_here
# TON_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
# PRIVATE_KEY=your_wallet_private_key_here

# GEMINI_API_KEY=your_gemini_api_key_here
# GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
# AI_ENABLED=true
# AI_FALLBACK_MESSAGE=AI Unavailable
```

### 3️⃣ Jalankan MQTT Broker

```bash
# Windows
mosquitto -v
# Mac/Linux
brew install mosquitto && mosquitto -v
```

### 4️⃣ Start Backend & Frontend

```bash
# Backend
cd backend
npm start
# Frontend (new terminal)
cd frontend
npm run dev
```

### 5️⃣ Test Data & Dashboard

```bash
# Kirim data contoh ke MQTT (terminal baru):
mosquitto_pub -h localhost -t "patient/test-001/telemetry" -m '{"deviceId":"test-001","bpm":75,"temp":36.5,"gps":"14.5995,120.9842","timestamp":1700000000}'
# Buka dashboard di browser:
http://localhost:3000
```

---

## 📂 Directory Structure

```txt
Blocate/
├── backend/   # Node.js backend, smart contracts, MQTT, GunDB
├── frontend/  # Next.js dashboard
└── README.md  # Root project info
```

---

## 🤝 Contributing

Pull requests and issues are welcome! Please follow conventional commit messages and ensure code is linted before submitting.

---

**Built for decentralized healthcare.**
