Perfect — we’ll keep it **Node.js (no TypeScript)**, and make this **Step 2 Markdown: Backend Architecture & Technical Flow**.
This one focuses on how your **IoT devices, decentralized backend, AI, and blockchain** all interact in the system, with enough depth to show clear engineering understanding for hackathon judges.

---

# ⚙️ Backend Architecture & Technical Flow

## 🧭 Overview

The backend serves as the **bridge between IoT devices, AI interpretation, decentralized storage, and blockchain logging**.
Each backend instance functions as an **independent DePIN node**, capable of:

* Receiving real-time sensor data from IoT devices
* Running health interpretation logic (via AI)
* Storing events on decentralized databases (OrbitDB + IPFS)
* Publishing proofs on-chain through Solidity smart contracts

Every node operates autonomously — no single point of failure — yet shares verified data through peer-to-peer synchronization.

---

## 🔩 Core Components

| Component             | Technology           | Role                                                              |
| --------------------- | -------------------- | ----------------------------------------------------------------- |
| **MQTT Client**       | `mqtt.js`            | Receives telemetry from IoT devices (ESP32 / NB-IoT).             |
| **Logic Layer**       | Node.js              | Filters, validates, and interprets sensor data.                   |
| **AI Integration**    | Gemini / OpenAI API  | Optional — interprets conditions like “abnormal BPM + GPS drift.” |
| **Decentralized DB**  | OrbitDB + IPFS       | Replicates event data across nodes, ensures integrity.            |
| **Blockchain Logger** | Solidity + Ethers.js | Stores event hashes immutably on-chain.                           |
| **REST API Layer**    | Express.js           | Exposes data to frontend dashboard or other peers.                |

---

## 🧱 Backend Flow

```text
[ESP32 Sensor Device]
   │  (MQTT publish JSON)
   ▼
[Node.js Backend]
   ├── mqttClient.js        → subscribes to device topics
   ├── logic.js             → interprets sensor data
   ├── aiClient.js          → optional AI request (Gemini/OpenAI)
   ├── orbitdbClient.js     → logs event into OrbitDB
   ├── blockchain.js        → pushes hash to smart contract
   └── api.js               → serves REST/WS endpoints
   ▼
[Frontend Dashboard]
   → fetch('/api/events')
```

### 1️⃣  IoT Device → MQTT

* ESP32 publishes telemetry JSON periodically:

  ```json
  {
    "deviceId": "esp32-001",
    "bpm": 118,
    "temp": 36.9,
    "gps": "6.2002,106.8219",
    "timestamp": 1730675013
  }
  ```
* Topics follow:

  ```
  patient/<deviceId>/telemetry
  patient/<deviceId>/alert
  ```

### 2️⃣  MQTT → Logic Layer

* Parses JSON, verifies structure, and determines status (normal / alert).
* Optional: AI API called for pattern recognition or context-based analysis.

### 3️⃣  Logic → OrbitDB

* Appends event object to local OrbitDB log.
* IPFS automatically syncs across other connected nodes.
* Example record:

  ```js
  {
    deviceId, bpm, temp, gps,
    condition: 'ALERT',
    aiInterpretation: 'Possible collapse risk',
    timestamp
  }
  ```

### 4️⃣  OrbitDB → Blockchain

* Compute SHA-256 hash of record and call Solidity function:

  ```solidity
  function logEvent(string memory deviceId, string memory eventType, bytes32 hash) public;
  ```
* Result: **tamper-proof, verifiable record** of critical events.

### 5️⃣  Blockchain → Frontend

* Frontend fetches data through API routes or directly from OrbitDB.
* Event proof (hash + tx hash) displayed on dashboard.

---

## 🧩 Node Structure

```
/backend
 ├── mqttClient.js        # handles device communication
 ├── logic.js             # interprets sensor data
 ├── aiClient.js          # connects to Gemini/OpenAI
 ├── orbitdbClient.js     # decentralized DB handler
 ├── blockchain.js        # Ethers.js / smart contract logger
 ├── api.js               # Express API endpoints
 ├── config.js            # env vars and broker/contract settings
 └── package.json
```

### Key Libraries

* `mqtt`
* `express`
* `ipfs`
* `orbit-db`
* `ethers`
* `crypto`
* `dotenv`

---

## 🧠 AI Interpretation Layer (Optional)

The backend can offload interpretation tasks to an AI API:

```js
const prompt = `Given BPM=${bpm}, TEMP=${temp}, GPS=${gps}, assess patient condition.`
const aiResponse = await fetch(GEMINI_API_URL, { method: 'POST', body: JSON.stringify({ prompt }) })
```

Result is attached to each event before storage.

---

## 🔗 Blockchain Interaction

* **Network**: Polygon Testnet / TON
* **Contract**: `PatientEventRegistry.sol`
* **Functions**:

  ```solidity
  function logEvent(string memory deviceId, string memory eventType, bytes32 hash) public;
  function getEvents(string memory deviceId) public view returns (Event[]);
  ```
* **Interaction** (Node.js):

  ```js
  import { ethers } from 'ethers'
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
  const contract = new ethers.Contract(CONTRACT_ADDR, abi, wallet)
  await contract.logEvent(deviceId, eventType, hash)
  ```

---

## 🌐 Express API Endpoints

| Route                   | Method | Description                            |
| ----------------------- | ------ | -------------------------------------- |
| `/api/events`           | GET    | Fetch recent events from OrbitDB       |
| `/api/events`           | POST   | Add new event (manual input / debug)   |
| `/api/status/:deviceId` | GET    | Get current state / last known reading |
| `/api/stream`           | WS/SSE | Real-time updates for dashboard        |

---

## 🧩 Data Synchronization

* **OrbitDB/IPFS:** ensures each node replicates logs from other peers.
* **Blockchain:** guarantees integrity (hash on-chain).
* **MQTT:** manages short-range telemetry transport.

Together, they form a **fully decentralized event pipeline** without any single Redis or SQL server.

---

## 🧠 Node Lifecycle

1. Node boots → starts IPFS, OrbitDB, MQTT client.
2. Subscribes to device topics.
3. On message → logic executes + AI optional.
4. Event stored in OrbitDB → blockchain proof created.
5. API exposes new event → dashboard updates.

---

## 🛠 Optional Extensions

* **Multi-node federation:** multiple guardians or hospitals share OrbitDB address.
* **Edge rewards:** nodes earn TON tokens for uptime or data integrity.
* **Offline buffering:** if blockchain or network unavailable, events queued locally.
* **NB-IoT fallback:** device can send via LTE network when Wi-Fi unavailable.

---

## ✅ Summary

* **Node.js backend** acts as a DePIN node, handling IoT ingestion, AI logic, decentralized data storage, and blockchain proofing.
* **No central server or Redis.**
* **OrbitDB** ensures peer data sync; **Solidity** ensures immutable verification.
* Scalable across hospitals, guardians, and patients with minimal coordination.

---

Would you like me to proceed to **Step 3: Backend Coding Guidelines & Tooling Setup (the final Markdown)** next? That one would cover your coding conventions, key npm packages, folder discipline, and how to spin up a local test environment (IPFS + MQTT + blockchain).
