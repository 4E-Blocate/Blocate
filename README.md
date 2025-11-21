# 🏥 BLocate - A solution to monitor patients and the elderly

A truly decentralized health monitoring system that connects ESP32 IoT sensors to blockchain, eliminating single points of failure and enabling permissionless deployment.

---

## Project Capabilities

**BLocate** enables real-time monitoring of patient vitals (heart rate, temperature, GPS location) through a fully decentralized architecture:

- ✅ **Real-time Monitoring** - ESP32 sensors continuously track patient health metrics
- ✅ **Smart Geofencing** - Alerts guardians when patients leave their home zone (0.5km radius)
- ✅ **AI Health Interpretation** - Gemini AI provides instant analysis of vital signs
- ✅ **Immutable Verification** - Event hashes stored on-chain for tamper-proof audit trails
- ✅ **Decentralized Storage** - Full event data replicated across peer-to-peer network
- ✅ **Guardian Alerts** - Automatic notifications for critical health events
---


## Quick Start

### Prerequisites
- Node.js v18+
- Mosquitto MQTT broker
- Metamask wallet with Sepolia ETH
- Alchemy API key (optional, for custom RPC)

### 5 Steps to Run the Backend

#### 1️⃣ Install Dependencies
```bash
cd backend
npm install
```

#### 2️⃣ Configure Environment
```bash
cp .env.example .env
# Edit .env with your keys:
# - TON_RPC (use provided Sepolia RPC or your Alchemy URL)
# - TON_PRIVATE_KEY (your wallet private key)
# - TON_CONTRACT_ADDRESS (already deployed: 0xf0916175fDF2678f46cF9997352C1A68f2133F84)
# - GEMINI_API_KEY (optional, for AI features)
```

#### 3️⃣ Start MQTT Broker
```bash
# Windows
mosquitto -v

# Mac/Linux
brew install mosquitto && mosquitto -v
```

#### 4️⃣ Run the Backend Node
```bash
npm start
```

#### 5️⃣ Test with Sample Data
```bash
# In another terminal, publish test telemetry:
mosquitto_pub -h localhost -t "patient/test-001/telemetry" -m '{"deviceId":"test-001","bpm":75,"temp":36.5,"gps":"14.5995,120.9842","timestamp":1700000000}'
```

**Backend will:**
- ✅ Receive MQTT message
- ✅ Analyze vitals with AI
- ✅ Check geofence distance
- ✅ Store full data in GunDB
- ✅ Log hash to Sepolia blockchain

---

## 🏗️ Architecture

### DePIN Components

| Component | Technology | Decentralization |
|-----------|------------|------------------|
| **IoT Sensors** | ESP32 (MQTT) | Anyone can deploy sensors |
| **Data Storage** | GunDB (P2P Graph DB) | Peer-to-peer replication |
| **Verification Layer** | Ethereum Sepolia (Smart Contracts) | Immutable on-chain proofs |
| **AI Analysis** | Google Gemini API | Hybrid (centralized AI) |
| **Geofencing** | Haversine Formula | Local calculation (no API) |
| **Backend Nodes** | Node.js | Multiple independent operators |

### Data Flow
```
ESP32 Sensor → MQTT → Backend Node → [AI Analysis + Geofence Check]
                                   ↓
                          GunDB (Full Data) + Blockchain (Hash)
                                   ↓
                          Frontend Dashboard (Direct Queries)
```

**No REST API required** - Frontend reads directly from blockchain + GunDB!

---

## 🛠️ Technologies Used

### Backend Stack
- **Node.js** (ES Modules)
- **Solidity 0.8.20** (Smart Contracts)
- **Hardhat** (Deployment & Testing)
- **ethers.js v6** (Blockchain Interaction)
- **GunDB** (Decentralized Graph Database)
- **MQTT.js** (IoT Communication)
- **Google Gemini AI** (Health Data Interpretation)

### Smart Contracts
- `PatientMonitor.sol` - Main entry point
- `DeviceRegistry.sol` - Device + Guardian management
- `EventLogger.sol` - Immutable event logging

### Deployed on Sepolia Testnet
- **Network**: Ethereum Sepolia
- **Contract Address**: `0xf0916175fDF2678f46cF9997352C1A68f2133F84`
- **View on Etherscan**: [Contract on Sepolia](https://sepolia.etherscan.io/address/0xf0916175fDF2678f46cF9997352C1A68f2133F84)

---

## 📋 Key Features

### 1. **Patient Profile on Blockchain**
Each device registration stores:
- Patient's full name
- Age
- Home GPS coordinates (for geofencing)
- Guardian wallet address

### 2. **Intelligent Event Classification**
- **Normal**: Vitals within healthy range
- **Alert**: Minor abnormalities or geofence breach
- **Critical**: Dangerous vital signs requiring immediate attention

### 3. **Geofencing System**
- Uses Haversine formula (pure math, no centralized API)
- Calculates distance between current GPS and home location
- Auto-alerts when patient exceeds 0.5km radius

### 4. **Hybrid Decentralization**
- **Fully Decentralized**: IoT messaging, data storage, verification, geofencing
- **Centralized**: AI interpretation (Google Gemini API)

---

## 🎓 Smart Contract Functions

### Device Management
```solidity
registerDevice(deviceId, guardian, fullName, age, homeLocation)
changeGuardian(deviceId, newGuardian)
deactivateDevice(deviceId)
```

### Event Logging
```solidity
logEvent(deviceId, dataHash, eventType)
getDeviceEvents(deviceId, limit)
```

### Queries
```solidity
getDevice(deviceId)
isDeviceRegistered(deviceId)
```

---

## 📂 Project Structure

```
backend/
├── contracts/          # Solidity smart contracts
│   ├── PatientMonitor.sol
│   ├── DeviceRegistry.sol
│   ├── EventLogger.sol
│   └── interfaces/
├── scripts/            # Deployment scripts
│   └── deploy.js
├── utils/              # Helper utilities
│   ├── crypto.js       # Hashing & event classification
│   └── geo.js          # Geofencing (Haversine)
├── index.js            # Main DePIN node entry point
├── mqttClient.js       # IoT telemetry receiver
├── gunClient.js        # Decentralized database
├── tonBlockchain.js    # Smart contract interaction
├── aiClient.js         # Gemini AI integration
├── logic.js            # Business logic (geofence + AI)
└── config.js           # Environment configuration
```

---

## 💡 Why DePIN?

Traditional patient monitoring systems rely on centralized servers that can:
- ❌ Fail completely during outages
- ❌ Be manipulated by single entities
- ❌ Require permission to deploy/access
- ❌ Lock users into proprietary ecosystems

**Patient Guardian DePIN solves this by:**
- ✅ Distributing infrastructure across independent nodes
- ✅ Storing immutable proofs on blockchain
- ✅ Enabling permissionless sensor deployment
- ✅ Eliminating vendor lock-in

---

## 🔐 Security

- ✅ Wallet-based authentication (no passwords)
- ✅ SHA-256 hashing for data integrity
- ✅ Private keys stored in `.env` (never committed)
- ✅ Peer-to-peer encryption (GunDB)
- ✅ On-chain verification (immutable audit trail)

---

## 🤝 Contributing

This is a hackathon project. Feel free to fork and extend!

**Built with passion for decentralized healthcare**
