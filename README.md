# 🏥🩺 BLocate: Decentralized Health Monitoring
<div align="center">
	<img src="https://i.imgur.com/xNlL0xh.png" alt="BLocate Project Banner" style="max-width:1000px;width:100%;margin-bottom:18px;" />
</div>



A decentralized health monitoring system using ESP32 IoT sensors, blockchain, and a modern dashboard. Eliminates single points of failure and enables permissionless deployment.

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


## 🛠️ Tech Stack

**Backend:**

<p align="center">
	<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
	<img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white" />
	<img src="https://img.shields.io/badge/Hardhat-F7DF1E?style=for-the-badge&logo=ethereum&logoColor=black" />
	<img src="https://img.shields.io/badge/ethers.js-121D33?style=for-the-badge&logo=ethereum&logoColor=white" />
	<img src="https://img.shields.io/badge/GunDB-000000?style=for-the-badge&logo=database&logoColor=white" />
	<img src="https://img.shields.io/badge/MQTT-660066?style=for-the-badge&logo=mqtt&logoColor=white" />
	<img src="https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" />
</p>

**Frontend:**

<p align="center">
	<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
	<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
	<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
	<img src="https://img.shields.io/badge/TailwindCSS-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8" />
	<img src="https://img.shields.io/badge/Ethers.js-121D33?style=for-the-badge&logo=ethereum&logoColor=white" />
	<img src="https://img.shields.io/badge/GunDB-000000?style=for-the-badge&logo=database&logoColor=white" />
</p>

---

## 🏗️ Architecture

![picture 0](https://i.imgur.com/Mj2zeHv.png)  

![picture 2](https://i.imgur.com/ZvZmli8.png)  

No REST API required — frontend reads directly from blockchain + GunDB!

---

## 👤 User Flow

![picture 1](https://i.imgur.com/vAbo7eK.png)  

---

## 📋 5 Steps to Run the Repository

### 1️⃣ Install Dependencies Backend & Frontend

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2️⃣ Configure Backend Environment

```bash
cd ../backend
cp .env.example .env

# Edit the .env file with the following data:

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

### 3️⃣ Run MQTT Broker

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
# Publish sample data to MQTT (new terminal):
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

## 👥 Developer Team – 4E

<table align="center" width="100%" style="table-layout:fixed;">
	<tr>
		<td colspan="4" align="center" style="padding:0 0 18px;">
			<img src="https://i.imgur.com/COJXUwQ.png" alt="BLocate Development Team" style="max-width:950px;width:100%;" />
		</td>
	</tr>
	<tr>
		<td align="center" width="25%"><b>J. David</b><br><i>Faculty of Engineering</i></td>
		<td align="center" width="25%"><b>Hakim N.</b><br><i>Faculty of Computer Science</i></td>
		<td align="center" width="25%"><b>Bryan H.</b><br><i>Faculty of Engineering</i></td>
		<td align="center" width="25%"><b>Laura F.S.</b><br><i>Faculty of Engineering</i></td>
	</tr>
</table>

---

**Built for decentralized healthcare.**
