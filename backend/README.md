# 🩺 Patient Guardian DePIN Node

Decentralized IoT Patient Monitoring System - Backend Node

## 🏗️ Architecture

This is a **DePIN (Decentralized Physical Infrastructure Network)** node that:

- ✅ Receives telemetry from ESP32 IoT devices via **MQTT**
- ✅ Stores full event data in **OrbitDB + IPFS** (decentralized)
- ✅ Logs event hashes to **TON blockchain** via **Solidity smart contract**
- ✅ Optionally interprets health data with **Gemini AI**
- ✅ Operates autonomously with peer-to-peer data sync

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- Mosquitto MQTT broker (local or remote)
- TON wallet with testnet tokens

### Installation

```bash
npm install
cp .env.example .env
# Edit .env with your configuration
```

### Run Node

```bash
npm start
```

## 📦 Components

| File | Purpose |
|------|---------|
| `index.js` | Main entry point, orchestrates all components |
| `mqttClient.js` | Listens to IoT device telemetry |
| `logic.js` | Processes sensor data, determines event type |
| `aiClient.js` | Gemini AI integration (optional) |
| `orbitdbClient.js` | Decentralized database storage |
| `tonBlockchain.js` | TON smart contract interaction |
| `config.js` | Environment configuration |
| `utils/crypto.js` | Hashing and validation utilities |
| `contracts/PatientMonitor.sol` | Solidity smart contract |

## 🔗 Smart Contract

The `PatientMonitor.sol` contract handles:

- Device registration (patient + guardian mapping)
- Event logging (stores SHA-256 hashes on-chain)
- Guardian management
- Device deactivation

**Key Functions:**
- `registerDevice(deviceId, guardian)` - Register new device
- `logEvent(deviceId, dataHash, eventType)` - Log health event
- `getDeviceEvents(deviceId, limit)` - Query events
- `changeGuardian(deviceId, newGuardian)` - Update guardian

## 🌐 Data Flow

```
ESP32 Sensor
    ↓ MQTT
MQTT Client (mqttClient.js)
    ↓
Logic Layer (logic.js)
    ↓
AI Interpretation (aiClient.js) [optional]
    ↓
    ├─→ OrbitDB (full data) ──→ IPFS Network
    └─→ TON Contract (hash) ──→ TON Blockchain
```

## 🧪 Testing

Publish test MQTT message:

```bash
mosquitto_pub -h localhost -t "patient/test-001/telemetry" -m '{"deviceId":"test-001","bpm":75,"temp":36.5,"gps":"0,0","timestamp":1699000000}'
```

## 🔐 Security

- Private keys in `.env` (never commit)
- Wallet-based authentication (TON Connect)
- SHA-256 hashing for data integrity
- Peer-to-peer encryption (IPFS)

## 📝 Environment Variables

See `.env.example` for all configuration options.

## 🎯 DePIN Principles

This node embodies DePIN by:
- ✅ Operating independently (no central server)
- ✅ Sharing data peer-to-peer (OrbitDB/IPFS)
- ✅ Verifying integrity on-chain (TON)
- ✅ Enabling anyone to run a node
- ✅ Rewarding node operators (optional TON transfers)

## 📄 License

MIT
