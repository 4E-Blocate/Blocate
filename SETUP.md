# Patient Guardian DePIN - Backend Setup Guide

## Prerequisites

Before you start, make sure you have:

- **Node.js v18+** installed ([Download here](https://nodejs.org/))
- **Git** installed
- **Mosquitto MQTT broker** installed (for IoT messaging)
  - Windows: [Download installer](https://mosquitto.org/download/)
  - Mac: `brew install mosquitto`
  - Linux: `sudo apt install mosquitto`
- **MetaMask wallet** with some Sepolia ETH (for deployment)

---

## Quick Start

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/noobplatinum/4E-BE.git
cd 4E-BE
```

### 2️⃣ Setup Backend

```bash
cd backend
npm install
```

### 3️⃣ Configure Environment

Create a `.env` file in the `backend/` directory (or get it from your teammate):

```bash
# Copy the example file
cp .env.example .env
```

Then edit `.env` with your values:

```env
NODE_ID=test-node-1
NODE_ENV=development

MQTT_BROKER=mqtt://localhost:1883
MQTT_USERNAME=
MQTT_PASSWORD=

TON_RPC=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
TON_PRIVATE_KEY=your_wallet_private_key_here
TON_CONTRACT_ADDRESS=0xf0916175fDF2678f46cF9997352C1A68f2133F84

GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
AI_ENABLED=false
AI_FALLBACK_MESSAGE="AI Unavailable"

PRIVATE_KEY=your_wallet_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
```

**Important:** Get the actual `.env` file from your teammate with the deployed contract address!

### 4️⃣ Start MQTT Broker

Open a **separate terminal** and run:

```bash
# Windows
mosquitto -v

# Mac/Linux
brew services start mosquitto
# Or run manually:
mosquitto -v
```

You should see output like:
```
1234567890: mosquitto version 2.x starting
1234567890: Opening ipv4 listen socket on port 1883.
```

### 5️⃣ Start the Backend Node

In your backend terminal:

```bash
npm start
```

You should see:
```
════════════════════════════════════════════════
  Patient Guardian DePIN Node v1.0
  Decentralized IoT Health Monitoring
════════════════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stage 1: Decentralized Storage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Initializing decentralized storage (GunDB)...
GunDB initialized

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stage 2: Blockchain Integration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Connecting to blockchain...
✅ Connected to Sepolia network
Wallet: 0x1234...5678
Contract: 0xf091...3F84

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stage 3: IoT Communication Layer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Connecting to MQTT broker...
✅ Connected to MQTT: mqtt://localhost:1883

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DePIN Node Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Listening for IoT device telemetry...
```

### 6️⃣ Test the Backend

Open **another terminal** and publish a test MQTT message:

```bash
mosquitto_pub -h localhost -t "patient/test-001/telemetry" -m '{"deviceId":"test-001","bpm":75,"temp":36.5,"gps":"14.5995,120.9842","timestamp":1700000000}'
```

You should see the backend process it:
```
Processing telemetry for test-001
   BPM: 75, Temp: 36.5°C, GPS: 14.5995,120.9842
   Event type: normal
Storing event in GunDB...
💾 Event stored in GunDB: 1234567890-abc123
```

---

## Running the Frontend

### 1️⃣ Navigate to Frontend

```bash
cd ../frontend
npm install
```

### 2️⃣ Start Development Server

```bash
npm run dev
```

You'll see:
```
  VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 3️⃣ Open in Browser

Visit `http://localhost:5173/` and connect your MetaMask wallet!

---

## Architecture Overview

```
ESP32 IoT Sensor → MQTT → Backend Node → [AI Analysis + Geofence Check]
                                       ↓
                              GunDB (Full Data) + Blockchain (Hash)
                                       ↓
                              Frontend Dashboard (Direct Queries)
```

**Backend listens for:**
- `patient/+/telemetry` - Regular health data
- `patient/+/alert` - Emergency alerts

**Backend stores:**
- Full event data in **GunDB** (local P2P database)
- Event hashes on **Sepolia blockchain** (immutable proof)

---

## Troubleshooting

### "MQTT connection failed"
- Make sure Mosquitto is running: `mosquitto -v`
- Check port 1883 is available

### "Blockchain connection failed"
- Verify your `.env` has correct `TON_RPC` and `TON_PRIVATE_KEY`
- Make sure the contract is deployed to Sepolia

### "Module not found" errors
- Run `npm install` in the backend directory
- Make sure you're using Node.js v18+

### "Frontend not loading"
- Make sure you ran `npm install` in the `frontend/` directory
- Check that port 5173 is available
- Try `npm run dev` again

---

## Project Structure

```
backend/
├── index.js              # Main DePIN node entry point
├── config.js             # Environment configuration
├── mqttClient.js         # MQTT broker connection
├── gunClient.js          # GunDB (P2P storage)
├── tonBlockchain.js      # Sepolia blockchain interaction
├── aiClient.js           # Gemini AI integration
├── logic.js              # Business logic (geofence, AI)
├── contracts/            # Solidity smart contracts
│   ├── PatientMonitor.sol
│   ├── DeviceRegistry.sol
│   └── EventLogger.sol
└── scripts/
    └── deploy.js         # Contract deployment script

frontend/
├── index.html            # Main UI
├── main.js               # Web3 interaction logic
├── style.css             # Styling
└── package.json
```

---

## Next Steps

1. **Register a device** via the frontend
2. **Send test telemetry** via MQTT
3. **View events** on the blockchain (Etherscan)
4. **Setup AI** by adding `GEMINI_API_KEY` to `.env`

---

## Useful Links

- **Deployed Contract:** [0xf0916175fDF2678f46cF9997352C1A68f2133F84](https://sepolia.etherscan.io/address/0xf0916175fDF2678f46cF9997352C1A68f2133F84)
- **Sepolia Faucet:** https://sepoliafaucet.com/
- **Alchemy Dashboard:** https://dashboard.alchemy.com/
- **Mosquitto Docs:** https://mosquitto.org/documentation/

---

**Built with ❤️ for decentralized healthcare**
