Perfect — here’s your **final, fully revised** version of
`Technical Clarifications (TON + Solidity Version).md`

This reflects the **real rulebook interpretation**:
you’re building for the **TON Track**, using **Solidity** smart contracts (EVM-compatible), **TON SDK** for blockchain access, and **TON Connect** for wallets.
TON Native (Tact/FunC) is *optional*, and you can mention it for bonus points.

---

# 🪐 Technical Clarifications (TON + Solidity Version)

## 🧭 Overview

This document explains the technical architecture and design decisions behind our **Decentralized Patient Monitoring Network**, competing under the **TON Track** of the hackathon.

The system integrates **IoT sensors**, **AI interpretation**, and **on-chain verification** through the **TON blockchain**, aligning with the **DePIN (Decentralized Physical Infrastructure Network)** concept.

All smart contracts are written in **Solidity** for fast iteration and EVM compatibility, while **TON SDK** and **TON Connect** are used for blockchain and wallet integration.

---

## ⚙️ System Architecture

| Layer                 | Technology                      | Role                                                        |
| --------------------- | ------------------------------- | ----------------------------------------------------------- |
| **IoT Hardware**      | ESP32 + BPM + Temperature + GPS | Collects and transmits real-time vital and location data    |
| **Messaging Layer**   | MQTT (self-hosted Mosquitto)    | Transfers telemetry from devices to backend nodes           |
| **Backend Node**      | Node.js + TON SDK               | Processes data, interprets it, logs events on-chain         |
| **AI Interpretation** | Gemini API                      | Converts sensor readings into simple health insights        |
| **Storage**           | OrbitDB + IPFS                  | Decentralized, peer-to-peer event logging                   |
| **Blockchain Layer**  | TON (via Solidity + TON SDK)    | Stores hashed proofs and node registry                      |
| **Identity / Auth**   | TON Connect Wallet              | Verifies guardian/patient identities using wallet ownership |

---

## 🌐 Architecture Diagram

```text
ESP32 Sensors
   │
   │  (MQTT Telemetry)
   ▼
Local MQTT Broker (Mosquitto)
   │
   │  (JSON packets)
   ▼
Node.js Backend
   ├── AI Interpretation (Gemini)
   ├── OrbitDB Log Storage
   └── TON SDK
        ├── Wallet interaction (TON Connect)
        └── Smart Contract calls (Solidity)
```

Each backend acts as a **DePIN node**, with its own MQTT broker, data replica, and TON wallet.
The TON blockchain serves as the decentralized proof ledger and incentive layer.

---

## 🧩 DePIN Breakdown

| Layer               | Implementation                | Decentralization Aspect                |
| ------------------- | ----------------------------- | -------------------------------------- |
| **Physical Layer**  | IoT sensors with ESP32 boards | Independent physical contributors      |
| **Network Layer**   | MQTT + OrbitDB                | Peer-to-peer communication & data sync |
| **Compute Layer**   | Node.js edge processors       | Autonomous local backends              |
| **Trust Layer**     | TON smart contracts           | Immutable proof of event integrity     |
| **Incentive Layer** | TON transfers (microrewards)  | Optional DePIN tokenization mechanism  |

---

## 💎 Blockchain Layer — TON via Solidity

### Design Goals

* Use **Solidity smart contracts** for familiarity and EVM compatibility.
* Deploy to **TON-compatible EVM layer** (via TON SDK).
* Log sensor event hashes and guardian-patient mappings.
* Enable **wallet-based registry** and optional **reward claiming**.

### Solidity Contract Example

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PatientMonitor {
    struct LogEntry {
        string deviceId;
        bytes32 dataHash;
        address guardian;
        uint256 timestamp;
    }

    mapping(string => address) public patientGuardian;
    LogEntry[] public logs;

    event EventLogged(string deviceId, address guardian, bytes32 dataHash, uint256 timestamp);

    function registerPatient(string memory deviceId) public {
        patientGuardian[deviceId] = msg.sender;
    }

    function logEvent(string memory deviceId, bytes32 dataHash) public {
        require(patientGuardian[deviceId] != address(0), "Device not registered");
        logs.push(LogEntry(deviceId, dataHash, msg.sender, block.timestamp));
        emit EventLogged(deviceId, msg.sender, dataHash, block.timestamp);
    }

    function getLogs() public view returns (LogEntry[] memory) {
        return logs;
    }
}
```

### Integration in Node.js Backend

```js
import { ethers } from 'ethers'
import abi from './PatientMonitorABI.json' assert { type: 'json' }

const provider = new ethers.providers.JsonRpcProvider(process.env.TON_RPC)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
const contract = new ethers.Contract(process.env.CONTRACT_ADDR, abi, wallet)

export async function logToTON(deviceId, hash) {
  const tx = await contract.logEvent(deviceId, hash)
  console.log('Event logged on TON:', tx.hash)
}
```

This structure ensures TON is used as the **on-chain truth layer**, verifying all sensor events.

---

## 👛 Wallet & Authentication — TON Connect

All user authentication uses **TON Connect**, replacing passwords entirely.

| Role         | Action                                          | Purpose                                   |
| ------------ | ----------------------------------------------- | ----------------------------------------- |
| **Guardian** | Connects TON wallet on web dashboard            | Links wallet to one or more patient UUIDs |
| **Patient**  | Device UUID tied to patient wallet on-chain     | Verifiable device ownership               |
| **Node**     | Backend signs on-chain logs with its wallet key | Proof of node participation               |

This ensures all relationships are verifiable and decentralized.
Each wallet interaction (register, log, claim) goes directly through TON SDK calls.

---

## 🌐 AI Integration — Gemini API

### Prompt Example

```text
You are a medical monitoring assistant.
Given:
BPM: <value>
Temperature: <value>
GPS: <lat, long>
Provide one short, realistic interpretation of patient condition.
Return one phrase only (e.g., "Stable", "Possible heat stress").
```

### Fallback

If AI fails, backend sets:

```
interpretation = "AI Unavailable"
```

and continues logging normally.
AI enhances usability but is optional to the core system.

---

## 📡 MQTT Layer — Self-Hosted Mosquitto

Each node runs a **local broker** to ensure no central dependency.

### Config

```bash
listener 1883
allow_anonymous true
persistence false
```

**Benefits**

* Local control & offline functionality.
* Each node can host or connect to its own broker.
* True DePIN compliance: no single broker dependency.

Future enhancement: add TLS + username/password.

---

## 🔑 Device Registration Flow

| Step | Description                                                                |
| ---- | -------------------------------------------------------------------------- |
| 1️⃣  | ESP32 generates a UUID during provisioning and saves it locally.           |
| 2️⃣  | Patient (via dashboard) registers the UUID to their TON wallet (on-chain). |
| 3️⃣  | Guardian links to a patient UUID (on-chain mapping).                       |
| 4️⃣  | Device publishes MQTT data to `patient/<UUID>/telemetry`.                  |
| 5️⃣  | Backend node logs each event hash to TON and OrbitDB.                      |

Result: fully decentralized pairing system without centralized servers.

---

## 🧾 Authentication Model

| Mechanism               | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| **Wallet-based login**  | Guardians and patients authenticate using TON Connect.    |
| **No password / OAuth** | Ownership = identity.                                     |
| **Roles on-chain**      | Patient ↔ Guardian relations stored in Solidity contract. |
| **Local test mode**     | Optional for offline demo, with mocked wallet addresses.  |

This ensures strong alignment with Web3 and TON’s decentralized identity model.

---

## ⚙️ Clarifications Summary (All 5 Points)

| #     | Topic                          | Final Decision                                                                                                                                                                                                        |
| ----- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | **TON Blockchain Integration** | TON is the **primary blockchain**. Smart contracts written in **Solidity** and deployed on TON-compatible EVM layer. Backend uses **TON SDK** for on-chain calls. TON Connect used for wallet login and transactions. |
| **2** | **AI Integration**             | Uses **Gemini API** to interpret BPM, temperature, and GPS. Prompt-based, single-phrase output. Fallback = `"AI Unavailable"`. Optional enhancement only.                                                             |
| **3** | **MQTT Broker**                | Self-hosted **Mosquitto** instance per node. No central broker. Each node subscribes to its own telemetry channels.                                                                                                   |
| **4** | **Device Registration Flow**   | **UUID generated on ESP32**, linked on-chain to patient’s wallet via Solidity contract. Guardian subscribes via UUID. No centralized registry or Redis.                                                               |
| **5** | **Authentication**             | Fully **wallet-based** using **TON Connect**. No passwords or centralized sessions. Guardian/patient roles assigned and verified on-chain.                                                                            |

---

## 🧠 Key Takeaways

* **TON-first architecture:** All verifications and registry stored on TON blockchain.
* **Solidity for smart contracts:** Mentor-friendly, fast to iterate, EVM-compatible.
* **Decentralized data pipeline:** MQTT + OrbitDB ensure no single point of failure.
* **DePIN compliant:** Physical sensors, peer nodes, and blockchain form a distributed network.
* **TON-native ready:** Optional Tact contract can be added later for the +5 “Best TON Native” bonus.

---

## 🧩 TL;DR Summary

| Component                   | Implementation                                               |
| --------------------------- | ------------------------------------------------------------ |
| **Track**                   | TON Track                                                    |
| **Blockchain**              | TON (EVM-compatible)                                         |
| **Smart Contract Language** | Solidity                                                     |
| **Wallets**                 | TON Connect                                                  |
| **Data Storage**            | OrbitDB + IPFS                                               |
| **IoT Connectivity**        | MQTT (Mosquitto)                                             |
| **AI**                      | Gemini (Optional)                                            |
| **Auth**                    | Wallet-based only                                            |
| **DePIN Principle**         | Independent nodes, decentralized data, on-chain verification |

---

✅ **In summary:**
This system is a **Solidity-based DePIN network running on TON**, integrating IoT devices, decentralized data replication, and wallet-verified user mapping —
built for the **TON Track** while maintaining full EVM compatibility and future TON-native extensibility.

---

Would you like me to follow up with a companion doc called
👉 **“DePIN and Blockchain Integration.md”**
to cover specifically *how the Solidity smart contract + TON Connect + OrbitDB layers tie together* (like a developer’s architecture blueprint)?
