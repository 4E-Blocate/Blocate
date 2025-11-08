# 🏥 DePIN Patient Monitor# 🚀 Patient Guardian DePIN - Backend



**Decentralized IoT Patient Monitoring System for TON Blockchain**True decentralized IoT patient monitoring system on TON blockchain.



> A truly decentralized health monitoring system where IoT devices, data storage, and verification are all distributed. No central server, no single point of failure.## ✨ What Makes This Decentralized?



## 🎯 What Is This?| Component | Centralized? | Why? |

|-----------|--------------|------|

A **DePIN (Decentralized Physical Infrastructure Network)** that connects real-world IoT health sensors to blockchain:| **IoT Devices** | ✅ Decentralized | Independent ESP32 sensors, anyone can deploy |

| **MQTT Broker** | ✅ Decentralized | Each node runs its own broker (Mosquitto) |

- **ESP32 IoT Devices** monitor patient vitals (heart rate, temperature)| **Data Storage** | ✅ Decentralized | OrbitDB + IPFS - peer-to-peer replication |

- **Backend DePIN Nodes** process telemetry autonomously  | **Blockchain** | ✅ Decentralized | TON smart contracts - immutable verification |

- **OrbitDB + IPFS** store full event data (peer-to-peer)| **Auth** | ✅ Decentralized | TON Connect wallet-based (no passwords) |

- **TON Blockchain** stores event hashes (immutable verification)| **Backend Node** | ✅ Decentralized | Anyone can run a node, no single point of failure |

- **Frontend Dashboard** queries blockchain + OrbitDB directly (no REST API!)

## 🏗️ Architecture

## ✨ Why Truly Decentralized?

```

| Component | Architecture | Why Decentralized |ESP32 IoT Device (Patient)

|-----------|--------------|-------------------|    ↓ MQTT

| **IoT Devices** | ESP32 sensors | Anyone can deploy, no permission needed |Backend DePIN Node

| **MQTT Broker** | Self-hosted Mosquitto per node | No central message broker |    ├─ MQTT Client ──→ Receives telemetry

| **Data Storage** | OrbitDB + IPFS | Peer-to-peer replication across nodes |    ├─ Logic Layer ──→ Validates + interprets

| **Verification** | TON Smart Contracts | Immutable, trustless proof |    ├─ AI Client ────→ Gemini (optional)

| **Authentication** | TON Connect (wallet-based) | No passwords, no central auth server |    ├─ OrbitDB ──────→ Stores full event data

| **Backend Nodes** | Multiple independent nodes | Any guardian/hospital can run one |    └─ Blockchain ───→ Logs hash to TON contract



**Frontend reads directly from blockchain + P2P storage - no API server required!**Frontend Dashboard (Guardian)

    ├─ TON Connect ──→ Wallet authentication

## 🚀 Quick Start    ├─ TON Contract ─→ Queries event hashes

    └─ OrbitDB ──────→ Fetches full event data

**See [DEPLOY.md](./DEPLOY.md) for complete setup guide.**```



```bash**No REST API for data queries** - frontend reads directly from blockchain + OrbitDB!

# 1. Install dependencies

npm install -g ganache## 🚀 Quick Start

choco install mosquitto  # or brew/apt-get

### 1. Prerequisites

# 2. Start infrastructure

ganache --port 8545 --deterministic  # Terminal 1```bash

mosquitto -v                          # Terminal 2# Install Mosquitto MQTT broker

# Windows: https://mosquitto.org/download/

# 3. Deploy contracts via Remix IDE# Mac: brew install mosquitto

# (See DEPLOY.md for detailed instructions)# Linux: apt-get install mosquitto



# 4. Configure backend# Start Mosquitto

cd backendmosquitto -v

npm install```

# Edit .env with contract address

### 2. Install & Configure

# 5. Start backend node

npm start```bash

cd backend

# 6. Test full stacknpm install

cd ../scriptscp .env.example .env

node test-full-stack.js# Edit .env with your TON wallet private key & contract address

``````



## 🏗️ Architecture### 3. Deploy Smart Contract



```Deploy `contracts/PatientMonitor.sol` to TON testnet, then add contract address to `.env`:

┌─────────────────┐         ┌──────────────────┐

│   ESP32 IoT     │ MQTT    │  Backend DePIN   │```env

│   Devices       ├────────→│  Node (Node.js)  │TON_CONTRACT_ADDRESS=0xYourContractAddress

└─────────────────┘         └────────┬─────────┘TON_PRIVATE_KEY=your_private_key_here

                                     │```

                    ┌────────────────┼────────────────┐

                    │                │                │### 4. Run DePIN Node

                    ▼                ▼                ▼

            ┌───────────┐    ┌───────────┐   ┌──────────┐```bash

            │  OrbitDB  │    │    TON    │   │  Gemini  │npm start

            │   (P2P)   │    │Blockchain │   │   AI     │```

            └─────┬─────┘    └─────┬─────┘   └──────────┘

                  │                │## 📡 Test IoT Telemetry

                  └────────┬───────┘

                           │Send test MQTT message:

                    ┌──────▼──────┐

                    │   Frontend  │```bash

                    │  (Next.js)  │mosquitto_pub -h localhost -t "patient/test-001/telemetry" -m '{

                    └─────────────┘  "deviceId": "test-001",

```  "bpm": 78,

  "temp": 36.8,

**Data Flow:**  "gps": "6.2002,106.8219",

1. ESP32 → MQTT telemetry  "timestamp": 1699000000000

2. Backend processes & validates}'

3. Optional: Gemini AI interprets```

4. OrbitDB stores full data (P2P)

5. Blockchain logs hash (proof)## 📦 Project Structure

6. Frontend queries both sources

```

## 📦 Project Structurebackend/

├── index.js              # Main entry point

```├── config.js             # Environment configuration

FlashType/├── mqttClient.js         # MQTT communication

├── backend/├── logic.js              # Data processing

│   ├── contracts/          # Solidity smart contracts (5 files)├── aiClient.js           # Gemini AI integration

│   ├── index.js            # Main DePIN node orchestrator├── orbitdbClient.js      # Decentralized storage

│   ├── tonBlockchain.js    # TON integration├── tonBlockchain.js      # TON contract interaction

│   ├── mqttClient.js       # IoT communication├── utils/

│   ├── orbitdbClient.js    # P2P storage│   └── crypto.js         # Hashing utilities

│   ├── aiClient.js         # Gemini AI (optional)├── contracts/

│   ├── logic.js            # Business logic│   └── PatientMonitor.sol  # Solidity smart contract

│   ├── config.js           # Configuration└── package.json

│   └── utils/crypto.js     # SHA-256 hashing```

├── scripts/

│   ├── deploy-local.js     # Deployment helper## 🔗 Smart Contract Functions

│   └── test-full-stack.js  # Integration tests

├── frontend-example.html   # Simple frontend demo### Patient Functions

├── DEPLOY.md              # Complete deployment guide- `registerDevice(deviceId, guardianAddress)` - Register new device

└── README.md              # This file

```### Backend Node Functions

- `logEvent(deviceId, dataHash, eventType)` - Log health event

## 🔧 Smart Contracts

### Frontend Query Functions  

**5 Modular Solidity Contracts (v0.8.20):**- `getDeviceEvents(deviceId, limit)` - Get recent events

- `getDevice(deviceId)` - Get device info

1. **IDeviceRegistry.sol** - Device registry interface- `isDeviceRegistered(deviceId)` - Check registration

2. **IEventLogger.sol** - Event logger interface  

3. **DeviceRegistry.sol** - Manages device-patient-guardian mappings## 🌐 Data Flow

4. **EventLogger.sol** - Stores event hashes on-chain

5. **PatientMonitor.sol** - Main entry point (facade pattern)1. **ESP32** sends telemetry via MQTT

2. **Backend Node** receives and processes

**Key Functions:**3. **AI** (optional) interprets health data

- `registerDevice(deviceId, guardian)` - Patient registers device4. **OrbitDB** stores full event data (replicated p2p)

- `logEvent(deviceId, dataHash, eventType)` - Backend logs event5. **TON Contract** stores event hash (immutable proof)

- `getDeviceEvents(deviceId, limit)` - Frontend queries events6. **Frontend** queries blockchain + OrbitDB directly

- `changeGuardian(deviceId, newGuardian)` - Patient updates guardian

## 🎯 DePIN Principles

## 🌐 Frontend Integration

✅ **Physical Infrastructure** - IoT sensors  

The frontend queries directly from blockchain + OrbitDB (no backend API):✅ **Decentralized Network** - Peer-to-peer nodes  

✅ **No Central Authority** - Self-sovereign data  

```javascript✅ **Blockchain Verification** - Immutable proofs  

// Query blockchain for event hashes✅ **Token Incentives** - Optional rewards for nodes  

import { ethers } from 'ethers';

const contract = new ethers.Contract(address, abi, provider);## 🔐 Security

const events = await contract.getDeviceEvents(deviceId, 10);

- ✅ Wallet-based authentication (TON Connect)

// Query OrbitDB for full event data- ✅ SHA-256 hashing for data integrity

import OrbitDB from 'orbit-db';- ✅ Private keys in `.env` (never committed)

const db = await orbitdb.open(dbAddress);- ✅ Peer-to-peer encryption (IPFS)

const fullData = db.all;

## 🧪 Development

// Authenticate with TON Connect

import TonConnect from '@tonconnect/sdk';```bash

const connector = new TonConnect();# Run with auto-reload

await connector.connect();npm run dev

```

# Check node health

See `frontend-example.html` for a working demo!# (No REST API - query blockchain directly!)

```

## 📡 IoT Device Setup

## 📝 Environment Variables

ESP32 devices publish telemetry to MQTT:

| Variable | Description | Required |

**Topic:** `patient/{DEVICE_ID}/telemetry`|----------|-------------|----------|

| `NODE_ID` | Unique node identifier | No |

**Payload:**| `MQTT_BROKER` | MQTT broker URL | Yes |

```json| `TON_RPC` | TON RPC endpoint | Yes |

{| `TON_PRIVATE_KEY` | Wallet private key | Yes |

  "deviceId": "ESP32-001",| `TON_CONTRACT_ADDRESS` | Deployed contract address | Yes |

  "heartRate": 75,| `ORBITDB_ADDRESS` | Shared OrbitDB address (for multi-node) | No |

  "temperature": 36.5,| `GEMINI_API_KEY` | Gemini AI key | No |

  "timestamp": 1699401234567| `AI_ENABLED` | Enable AI interpretation | No |

}

```## 🎓 For Hackathon Judges



Backend automatically:This is a **true DePIN system** because:

- Validates data

- Determines event type (normal/alert/critical)1. **No central server** - Each guardian/hospital runs their own node

- Stores in OrbitDB2. **Peer-to-peer data** - OrbitDB replicates across all nodes

- Logs hash to blockchain3. **Blockchain verification** - TON contract ensures integrity

4. **Self-sovereign** - Patients/guardians control their own data

## 🎓 For Hackathon Judges5. **Permissionless** - Anyone can deploy a node or device



**This is a TRUE DePIN because:**The "backend" is actually a **decentralized edge node** - many of them can run in parallel with no coordination needed!



✅ **Decentralized Infrastructure** - IoT devices are physical infrastructure  ## 📄 License

✅ **No Central Server** - Each node is autonomous  

✅ **Peer-to-Peer Data** - OrbitDB replicates across all nodes  MIT

✅ **Blockchain Verification** - Immutable proofs on TON  

✅ **Permissionless** - Anyone can deploy a node or device  ---

✅ **Self-Sovereign** - Patients/guardians control their own data

**Built for TON Track Hackathon 🏆**  

**Novel Aspects:**Decentralized IoT + DePIN + Healthcare

- Backend nodes are processors, not data servers
- Frontend queries blockchain + P2P storage directly
- No REST API for data (truly Web3!)
- Modular smart contract architecture
- Optional AI interpretation layer

## 🛠️ Tech Stack

- **Blockchain:** TON (EVM-compatible) with Solidity ^0.8.20
- **Smart Contract Lib:** ethers.js v6.9.0
- **P2P Storage:** OrbitDB v0.29.0 + IPFS v0.66.1
- **IoT Protocol:** MQTT v5.3.0 (Mosquitto)
- **AI:** Gemini API (optional)
- **Runtime:** Node.js 18+
- **Frontend:** Vanilla JS / React / Next.js

## 📝 License

MIT

---

**Built for TON Blockchain Hackathon 🏆**  
*DePIN Track - Decentralized IoT Healthcare*

**[📖 Full Deployment Guide](./DEPLOY.md)** | **[🔬 Test Demo](./frontend-example.html)**
