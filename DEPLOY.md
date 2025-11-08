# 🏥 DePIN Patient Monitor - Complete Deployment Guide

## Overview

This is a **Decentralized IoT Patient Monitoring System** built for TON blockchain. The architecture is truly decentralized:
- **Smart Contracts** store event hashes on-chain (immutable verification)
- **OrbitDB + IPFS** stores full event data (peer-to-peer, no central server)
- **MQTT** handles IoT device communication
- **Backend DePIN Nodes** process telemetry autonomously
- **Frontend** queries blockchain + OrbitDB directly (no REST API)

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites

- ✅ Node.js 18+
- ✅ Git
- ⬜ Ganache (local blockchain) - we'll install this
- ⬜ Mosquitto (MQTT broker) - we'll install this
- ⬜ MetaMask browser extension

### Step 1: Install Global Dependencies

```bash
# Install Ganache (local Ethereum blockchain)
npm install -g ganache

# Install Mosquitto MQTT broker
# Windows:
# Download installer from: https://mosquitto.org/download/
# OR use this direct link: https://mosquitto.org/files/binary/win64/mosquitto-2.0.18-install-windows-x64.exe
# Run the installer, follow wizard (keep default settings)

# Mac:
brew install mosquitto

# Linux:
sudo apt-get install mosquitto mosquitto-clients
```

### Step 2: Install Project Dependencies

```bash
cd backend
npm install
```

### Step 3: Start Infrastructure

**Terminal 1 - Ganache (Blockchain):**
```bash
ganache --port 8545 --deterministic
```

Keep this running! You should see:
```
Available Accounts
==================
(0) 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1 (1000 ETH)
...

Private Keys
==================
(0) 0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
...

RPC Listening on 127.0.0.1:8545
```

**Terminal 2 - Mosquitto (MQTT):**
```bash
mosquitto -v
```

### Step 4: Deploy Smart Contracts

#### 4.1 Setup MetaMask

1. Install [MetaMask](https://metamask.io/) browser extension
2. Add custom network:
   - Network Name: `Ganache Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency: `ETH`
3. Import Account:
   - Click "Import Account"
   - Paste private key: `0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d`
   - You should see 1000 ETH balance

#### 4.2 Deploy via Remix IDE

1. **Open Remix**: https://remix.ethereum.org

2. **Create Contract Files** (copy from `backend/contracts/`):
   - Right-click workspace → "New File"
   - Create these 5 files:
     - `IDeviceRegistry.sol`
     - `IEventLogger.sol`
     - `DeviceRegistry.sol`
     - `EventLogger.sol`
     - `PatientMonitor.sol`
   - Copy-paste the code from your local `backend/contracts/` folder

3. **Compile**:
   - Click "Solidity Compiler" tab (left sidebar)
   - Select compiler version: `0.8.20`
   - Click "Compile PatientMonitor.sol"
   - Wait for green checkmark ✅

4. **Deploy**:
   - Click "Deploy & Run" tab
   - Environment: Select **"Injected Provider - MetaMask"**
   - MetaMask will popup → Connect
   - Contract: Select **"PatientMonitor"**
   - Click **"Deploy"** button
   - Confirm transaction in MetaMask
   - Wait for deployment (~5 seconds)

5. **Copy Contract Address**:
   - Look at "Deployed Contracts" section
   - Click the copy icon next to the contract address
   - Example: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

### Step 5: Configure Backend

Edit `backend/.env`:

```env
# Node Configuration
NODE_ID=local-node-1
NODE_ENV=development

# MQTT Configuration
MQTT_BROKER=mqtt://localhost:1883
MQTT_USERNAME=
MQTT_PASSWORD=

# IPFS/OrbitDB Configuration
IPFS_REPO=./ipfs-repo
ORBITDB_DIRECTORY=./orbitdb-data
ORBITDB_ADDRESS=

# Blockchain Configuration (UPDATE THESE!)
TON_RPC=http://127.0.0.1:8545
TON_PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
TON_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE

# AI Configuration (Optional)
GEMINI_API_KEY=
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
AI_ENABLED=false
AI_FALLBACK_MESSAGE=AI Unavailable
```

**IMPORTANT**: Replace `TON_CONTRACT_ADDRESS` with the address you copied from Remix!

### Step 6: Start Backend DePIN Node

**Terminal 3:**
```bash
cd backend
node index.js
```

You should see:
```
🚀 DePIN Node Starting...
   Node ID: local-node-1
   Environment: development

📦 Initializing OrbitDB...
✅ OrbitDB initialized
   Database: /orbitdb/...

🔗 Connecting to TON blockchain...
   RPC: http://127.0.0.1:8545
✅ Connected to network: unknown (Chain ID: 1337)
   Wallet: 0x90F8...c9C1
   Balance: 1000.0 ETH
✅ Contract initialized: 0x5FbD...0aa3

📡 Connecting to MQTT broker...
✅ MQTT client connected
   Broker: mqtt://localhost:1883
   Subscribed to: patient/+/telemetry
   Subscribed to: patient/+/alert

🎉 DePIN Node Ready!
```

### Step 7: Test the System

**Terminal 4:**
```bash
cd scripts
node test-full-stack.js
```

This will:
- Register a test device on the blockchain
- Simulate IoT telemetry (normal, alert, critical events)
- Store full data in OrbitDB
- Log event hashes to blockchain
- Verify everything works end-to-end

Expected output:
```
🧪 IoT Device Simulator & Full Stack Test

📡 Connected to blockchain: http://127.0.0.1:8545
🔑 Using account: 0x90F8...c9C1
📝 Contract address: 0x5FbD...0aa3
📊 Total devices: 0
📊 Total events: 0

🧪 Test 1: Device Registration
📝 Registering device: ESP32-SIMULATOR-001
✅ Device registered!
   Patient: 0x90F8...c9C1
   Guardian: 0x7099...79C8
   Active: true

🧪 Test 2: MQTT Telemetry Simulation
✅ Connected to MQTT broker

📡 Publishing normal telemetry: {...}
🚨 Publishing alert telemetry: {...}
🔴 Publishing critical telemetry: {...}

🧪 Test 3: Verify Blockchain Events
✅ Found 3 events on blockchain:
   Event #1:
   - Type: normal
   - Hash: 0x...
   - Timestamp: 2025-11-08T...

📊 Total events now: 3

🎉 Full stack test complete!
```

---

## 🌐 Frontend Integration

Your backend is now fully operational and ready for frontend integration!

### Frontend Example (Vanilla JS)

Open `frontend-example.html` in your browser to see a working demo. It shows how to:
- Connect to the blockchain via ethers.js
- Query smart contract for events
- Display device statistics
- Load recent health events

### React/Next.js Integration

```bash
npx create-next-app@latest frontend
cd frontend
npm install ethers orbit-db ipfs
```

**Example: Query Blockchain**

```javascript
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  CONTRACT_ABI, // From PatientMonitor.abi.json
  provider
);

// Get device events
const events = await contract.getDeviceEvents(deviceId, 10);
```

**Example: Query OrbitDB (P2P Data)**

```javascript
import IPFS from 'ipfs';
import OrbitDB from 'orbit-db';

const ipfs = await IPFS.create();
const orbitdb = await OrbitDB.createInstance(ipfs);
const db = await orbitdb.open(ORBITDB_ADDRESS);

// Get all events with full telemetry data
const allEvents = db.all;
```

**Example: TON Connect Authentication**

```javascript
import TonConnect from '@tonconnect/sdk';

const connector = new TonConnect();
await connector.connect();

// Get wallet address
const wallet = connector.wallet;
```

---

## 📡 ESP32 IoT Device Setup

Your ESP32 devices should publish telemetry to MQTT:

**Topic Format:**
```
patient/{DEVICE_ID}/telemetry
patient/{DEVICE_ID}/alert
```

**Message Format (JSON):**
```json
{
  "deviceId": "ESP32-001",
  "heartRate": 75,
  "temperature": 36.5,
  "timestamp": 1699401234567
}
```

**Arduino Code Example:**

```cpp
#include <WiFi.h>
#include <PubSubClient.h>

const char* deviceId = "ESP32-001";
const char* mqtt_server = "your-mqtt-broker.com";

WiFiClient espClient;
PubSubClient client(espClient);

void publishTelemetry(int heartRate, float temp) {
  String topic = "patient/" + String(deviceId) + "/telemetry";
  
  String payload = "{";
  payload += "\"deviceId\":\"" + String(deviceId) + "\",";
  payload += "\"heartRate\":" + String(heartRate) + ",";
  payload += "\"temperature\":" + String(temp) + ",";
  payload += "\"timestamp\":" + String(millis());
  payload += "}";
  
  client.publish(topic.c_str(), payload.c_str());
}
```

---

## 🔧 Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐
│   ESP32 IoT     │ MQTT    │  Backend DePIN   │
│   Devices       ├────────→│  Node (Node.js)  │
└─────────────────┘         └────────┬─────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
            ┌───────────┐    ┌───────────┐   ┌──────────┐
            │  OrbitDB  │    │    TON    │   │  Gemini  │
            │   (P2P)   │    │Blockchain │   │   AI     │
            └─────┬─────┘    └─────┬─────┘   └──────────┘
                  │                │
                  │                │
            ┌─────▼────────────────▼─────┐
            │      Frontend (Next.js)    │
            │  - Queries blockchain      │
            │  - Queries OrbitDB (P2P)   │
            │  - TON Connect auth        │
            └────────────────────────────┘
```

**Data Flow:**
1. ESP32 sends telemetry via MQTT
2. Backend DePIN node receives it
3. Node processes & determines event type (normal/alert/critical)
4. Optional: Gemini AI interprets health data
5. Full event stored in OrbitDB (decentralized)
6. Event hash stored on TON blockchain (immutable proof)
7. Frontend queries both blockchain (hashes) and OrbitDB (full data)

---

## 🚢 Production Deployment

### Deploy to TON Testnet

1. **Get TON Testnet Tokens**:
   - Visit TON testnet faucet
   - Request tokens for your wallet

2. **Update `.env`**:
   ```env
   TON_RPC=https://testnet.toncenter.com/api/v2/jsonRPC
   TON_PRIVATE_KEY=your_real_private_key
   ```

3. **Deploy contracts to testnet** (same Remix process, but use testnet in MetaMask)

4. **Update contract address** in `.env`

### Deploy Backend (Multi-Node DePIN)

For true decentralization, run multiple backend nodes:

```bash
# Node 1
NODE_ID=node-us-east npm start

# Node 2 (different server)
NODE_ID=node-eu-west ORBITDB_ADDRESS=<node1_db_address> npm start

# Node 3 (different server)
NODE_ID=node-asia ORBITDB_ADDRESS=<node1_db_address> npm start
```

All nodes share the same OrbitDB database (P2P replication) and log to the same smart contract.

### Deploy Frontend

```bash
cd frontend
npm run build
# Deploy to Vercel, Netlify, or any hosting
```

---

## 🐛 Troubleshooting

**Ganache won't start:**
- Make sure port 8545 is not in use
- Try: `ganache --port 8546` (use different port)

**Mosquitto connection refused:**
- Check if Mosquitto is running: `mosquitto -v`
- Verify port 1883 is not blocked by firewall

**Backend can't connect to blockchain:**
- Ensure Ganache is running
- Check `TON_CONTRACT_ADDRESS` is correct in `.env`
- Verify `TON_RPC` URL matches Ganache

**OrbitDB errors:**
- Delete `./ipfs-repo` and `./orbitdb-data` folders
- Restart backend (will recreate databases)

**MetaMask shows wrong balance:**
- Click MetaMask → Settings → Advanced → Reset Account

---

## 📚 Project Structure

```
FlashType/
├── backend/
│   ├── contracts/          # Solidity smart contracts
│   │   ├── IDeviceRegistry.sol
│   │   ├── IEventLogger.sol
│   │   ├── DeviceRegistry.sol
│   │   ├── EventLogger.sol
│   │   └── PatientMonitor.sol
│   ├── utils/
│   │   └── crypto.js       # SHA-256 hashing
│   ├── index.js            # Main DePIN node
│   ├── config.js           # Environment configuration
│   ├── tonBlockchain.js    # Blockchain integration
│   ├── mqttClient.js       # MQTT client
│   ├── orbitdbClient.js    # OrbitDB/IPFS
│   ├── aiClient.js         # Gemini AI (optional)
│   ├── logic.js            # Business logic
│   └── .env                # Configuration
├── scripts/
│   ├── deploy-local.js     # Deploy helper
│   └── test-full-stack.js  # Integration tests
├── frontend-example.html   # Simple frontend demo
└── DEPLOY.md              # This guide
```

---

## 🎯 What's Next?

After completing this guide, you have:
- ✅ Smart contracts deployed and functional
- ✅ Backend DePIN node processing IoT data
- ✅ OrbitDB storing events (decentralized)
- ✅ Blockchain logging event hashes (immutable)
- ✅ Full system tested end-to-end

**Now you can:**
1. Build a production frontend (React/Next.js)
2. Deploy to TON testnet/mainnet
3. Flash ESP32 firmware for real IoT devices
4. Set up multiple DePIN nodes globally
5. Add features (notifications, analytics, etc.)

**Your decentralized IoT patient monitoring system is ready! 🎉**
