Perfect — this is the **final and most technical document**:
Step 3 — *Backend Development Guidelines & Tooling Setup*.

This Markdown assumes you’re already building on **Node.js**, using **MQTT + OrbitDB + IPFS + Solidity (EVM)**, and optionally **TON** for DePIN alignment.
It’s written to be developer-ready — the kind of README section your hackathon repo would impress judges and devs with.

---

# 🧰 Backend Development Guidelines & Tooling Setup

## ⚙️ Tech Stack Summary

| Layer         | Technology                         | Description                                      |
| ------------- | ---------------------------------- | ------------------------------------------------ |
| Runtime       | **Node.js (ESM)**                  | Primary runtime for backend node                 |
| Messaging     | **MQTT.js**                        | Receives telemetry from IoT (ESP32 / NB-IoT)     |
| Storage       | **OrbitDB + IPFS**                 | Decentralized peer-to-peer event storage         |
| Blockchain    | **Solidity + Ethers.js / TON SDK** | Immutable proof of event data                    |
| AI (optional) | **Gemini / OpenAI API**            | Interprets BPM, temperature, and GPS data        |
| API Layer     | **Express.js**                     | Serves dashboard endpoints and WebSocket updates |

---

## 🏗️ Folder Structure

```
/backend
 ├── config.js             # environment variables
 ├── mqttClient.js         # subscribes to IoT topics
 ├── logic.js              # sensor interpretation + AI
 ├── orbitdbClient.js      # OrbitDB/IPFS setup
 ├── blockchain.js         # Solidity / TON interaction
 ├── api.js                # Express routes + websocket
 ├── utils/
 │    └── crypto.js        # SHA-256 hashing, signing
 ├── contracts/
 │    └── PatientEventRegistry.sol
 ├── package.json
 ├── .env.example
 └── README.md
```

---

## 🧩 Installation & Setup

### 1️⃣ Clone and Install

```bash
git clone https://github.com/<your-org>/<your-repo>.git
cd backend
npm install
```

### 2️⃣ Environment Variables

Create a `.env` file:

```env
MQTT_BROKER=mqtt://localhost
IPFS_API=/ip4/127.0.0.1/tcp/5001
PRIVATE_KEY=<wallet_private_key>
RPC_URL=https://rpc-amoy.polygon.technology
CONTRACT_ADDR=0x...
TON_RPC=https://toncenter.com/api/v2/jsonRPC
AI_KEY=<gemini_api_key>
```

### 3️⃣ Run Local Node

```bash
node api.js
```

---

## 🌐 MQTT Integration

### 📡 Topics

```
patient/<deviceId>/telemetry
patient/<deviceId>/alert
```

### Example Code

```js
import mqtt from 'mqtt'
import { processTelemetry } from './logic.js'

const client = mqtt.connect(process.env.MQTT_BROKER)

client.on('connect', () => {
  console.log('MQTT connected')
  client.subscribe('patient/+/telemetry')
})

client.on('message', (topic, message) => {
  try {
    const payload = JSON.parse(message.toString())
    processTelemetry(payload)
  } catch (err) {
    console.error('Invalid message', err)
  }
})
```

---

## 🪐 Decentralized Data Storage (OrbitDB + IPFS)

### Setup

```js
import IPFS from 'ipfs'
import OrbitDB from 'orbit-db'

export async function setupOrbitDB() {
  const ipfs = await IPFS.create({ repo: './ipfs-repo' })
  const orbitdb = await OrbitDB.createInstance(ipfs)
  const db = await orbitdb.log('patient-events')
  console.log('OrbitDB address:', db.address.toString())
  return db
}
```

### Record Insert

```js
await db.add({
  deviceId,
  bpm,
  temp,
  gps,
  condition: 'ALERT',
  timestamp: Date.now()
})
```

**Why OrbitDB?**

* Peer-to-peer replication via IPFS PubSub.
* No central database required.
* CRDT conflict resolution (decentralized merges).

---

## 🔗 Blockchain Integration

### Solidity Contract (EVM example)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PatientEventRegistry {
    struct EventLog {
        string deviceId;
        string eventType;
        bytes32 hash;
        uint256 timestamp;
    }

    EventLog[] public logs;
    event EventRecorded(string deviceId, string eventType, bytes32 hash, uint256 timestamp);

    function logEvent(string memory deviceId, string memory eventType, bytes32 hash) public {
        logs.push(EventLog(deviceId, eventType, hash, block.timestamp));
        emit EventRecorded(deviceId, eventType, hash, block.timestamp);
    }

    function getEvents() public view returns (EventLog[] memory) {
        return logs;
    }
}
```

### Node.js Interaction

```js
import { ethers } from 'ethers'
import abi from './contracts/PatientEventRegistry_abi.json' assert { type: 'json' }

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
const contract = new ethers.Contract(process.env.CONTRACT_ADDR, abi, wallet)

export async function logOnChain(deviceId, eventType, hash) {
  const tx = await contract.logEvent(deviceId, eventType, hash)
  console.log('Logged on-chain:', tx.hash)
}
```

---

## 🧠 AI Interpretation (Optional)

### Example

```js
import fetch from 'node-fetch'

export async function interpretAI(data) {
  const prompt = `Given BPM=${data.bpm}, TEMP=${data.temp}, and GPS=${data.gps},
  determine patient risk level: low, medium, or high.`

  const res = await fetch('https://api.gemini.com/v1/predict', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.AI_KEY}` },
    body: JSON.stringify({ prompt })
  })

  const output = await res.json()
  return output.prediction || 'unknown'
}
```

---

## 🪙 TON & DePIN Integration

### TON SDK Basics

```bash
npm install ton ton-core ton-crypto ton-connect
```

### Node.js Snippet

```js
import { TonClient, WalletContractV4, internal } from 'ton'

const client = new TonClient({ endpoint: process.env.TON_RPC })
const wallet = WalletContractV4.create({ workchain: 0, publicKey: Buffer.from(PUBLIC_KEY, 'hex') })
const seqno = await wallet.getSeqno()

await wallet.sendTransfer({
  seqno,
  secretKey: PRIVATE_KEY,
  messages: [internal({ to: TON_RECEIVER, value: '0.01', body: 'Node uptime reward' })],
})
```

### DePIN Logic

* Each node registers on-chain (TON smart contract or Polygon).
* Nodes earn micro-rewards for event reliability or uptime.
* TON transactions can be triggered automatically every N successful readings.

This showcases **DePIN principles**:
✅ distributed infrastructure
✅ verifiable node contributions
✅ tokenized incentive layer

---

## 🧠 Decentralization Guidelines

| Principle               | Implementation                                                          |
| ----------------------- | ----------------------------------------------------------------------- |
| **No Central DB**       | All events stored in OrbitDB (replicated via IPFS).                     |
| **No Single Backend**   | Each guardian/patient node runs its own backend instance.               |
| **Event Integrity**     | SHA-256 hash stored on-chain (Solidity).                                |
| **Data Availability**   | IPFS ensures peer access to logs.                                       |
| **AI Offload Optional** | Interpretation done locally or through external API (non-essential).    |
| **Transparent Proofs**  | Each alert links to blockchain tx hash.                                 |
| **Self-Sovereign Data** | Node retains control of its OrbitDB files — no shared server ownership. |

---

## 🧪 Local Development Environment

| Service     | Tool              | Command            |
| ----------- | ----------------- | ------------------ |
| MQTT Broker | Mosquitto / Aedes | `mosquitto -v`     |
| IPFS Node   | IPFS CLI          | `ipfs daemon`      |
| Blockchain  | Hardhat / Remix   | `npx hardhat node` |
| Backend     | Node.js           | `node api.js`      |
| Dashboard   | Next.js           | `npm run dev`      |

---

## 🧰 Testing Utilities

* **Postman / curl** → test `/api/events` routes.
* **MQTT Explorer** → simulate device telemetry.
* **Remix IDE / Hardhat** → test smart contract.
* **OrbitDB Playground** → verify decentralized replication.

---

## 📜 Coding Guidelines

| Area                | Guideline                                              |
| ------------------- | ------------------------------------------------------ |
| **Style**           | ES Modules (`import/export`), Prettier for formatting. |
| **Error Handling**  | Always wrap MQTT/AI/Blockchain calls with `try/catch`. |
| **Security**        | Keep `.env` out of Git, use dummy keys in demos.       |
| **Resilience**      | Queue unsent blockchain logs locally (if offline).     |
| **Scalability**     | Use one OrbitDB per region/hospital node.              |
| **Data Validation** | Validate incoming telemetry with JSON schema (Ajv).    |

---

## 🌐 Node Lifecycle Diagram

```text
Start Node.js
  ├── Connect to MQTT broker
  ├── Start IPFS + OrbitDB
  ├── Subscribe to telemetry topics
  ├── On data:
  │     ├── Validate JSON
  │     ├── Optionally interpret w/ AI
  │     ├── Store event in OrbitDB
  │     └── Log hash to blockchain
  ├── Serve API routes
  └── Peer sync + dashboard updates
```

---

## 🏁 Summary

* Entire backend runs as **a decentralized node**: no Redis, no central DB.
* **Node.js + OrbitDB + IPFS** handle all real-time data storage and replication.
* **Solidity / TON** smart contracts secure proofs and incentivize DePIN participation.
* **MQTT** provides IoT connectivity; **Express** exposes REST routes for dashboards.
* **AI interpretation** adds real-time intelligence but remains optional.

> In short: a **Web3-ready IoT backend** — lightweight, decentralized, auditable, and deployable per edge node.

---

Would you like me to make a concise **summary `README.md`** next (that merges Step 1 + 2 + 3 into one polished hackathon-submission-ready file)?
It’d include the short description, architecture diagram, and repo usage — basically your front-page document.
