Perfect — that flow diagram is really clear, and your breakdown already captures all the critical hackathon pillars (Frontend, Backend, Hardware, and Presentation).

Let’s start by drafting **Step 1: Project Overview + Features** as a clean Markdown document you can drop straight into your repo (`README.md` or `docs/overview.md`).

---

# 🩺 Project Overview — *Decentralized IoT Patient Guardian System*

## 🎯 General Idea

This project aims to build a **decentralized patient monitoring and alert system** connecting **patients’ IoT wearable devices** with their **guardians’ dashboards** in real time.
Each device periodically collects vital data (heart rate, temperature, GPS) and sends it via **Wi-Fi or NB-IoT** to a decentralized backend that interprets it using AI and stores events immutably on-chain.

The goal: **enable guardians to monitor patients anywhere** with real-time alerts, decentralized reliability, and extensible AI analytics.

---

## 🌐 High-Level Flow

| Role         | Action                  | Description                                                                                                                                |
| ------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Patient**  | Uses IoT device         | Device collects sensor data (BPM, temperature, GPS) and connects to Wi-Fi or NB-IoT.                                                       |
| **Guardian** | Uses phone/PC dashboard | Registers device ID, subscribes to patient data, and receives alerts.                                                                      |
| **System**   | Decentralized backend   | Each node (hospital, guardian, or patient device) participates in data logging and replication through OrbitDB/IPFS and blockchain proofs. |

### Setup Stage (Once)

1. Guardian inputs **Device ID** on web dashboard.
2. Sets **device name** + Wi-Fi SSID and password.
3. Device connects and begins periodic sensor readings.

### Real-Time Stage

* Device sends telemetry → MQTT → decentralized backend.
* Backend node interprets with AI (Gemini/OpenAI).
* Result stored in OrbitDB (for sync) and hashed on blockchain (for integrity).
* Guardian dashboard updates live with notifications.

---

## 🧩 Key Features

### 👨‍⚕️ Core

* **Real-Time Sensor Reading**
* **Live Patient Location Tracking**
* **AI-Assisted Health Interpretation** (BPM + Temperature + GPS)
* **SIM-based NB-IoT Range or Wi-Fi Connectivity**
* **Decentralized Data Storage (OrbitDB/IPFS)**
* **Immutable Blockchain Proofs (Solidity + TON)**

### 👥 Multi-User Logic

* Separate **Guardian** and **Patient** accounts.
* Guardians can subscribe to multiple patients (UUID-based linking).
* All communication end-to-end through decentralized network.

---

## 🧱 Architecture Snapshot

**Frontend**

* Next.js (React)
* “Mind-Coding” design (minimal, intuitive UX)
* Real-time dashboard + device management

**Backend**

* Node.js
* MQTT.js + C++ (ESP32 firmware)
* OrbitDB/IPFS (decentralized storage)
* Solidity Smart Contract (on-chain logging)
* Optional AI Integration via Gemini/OpenAI

**Hardware**

* BPM Sensor
* Temperature Sensor
* GPS Module
* NB-IoT / Wi-Fi Module
* Rechargeable Battery

**Presentation / Hackathon Gimmicks**

* NB-IoT → Wi-Fi mode (SSID/Password hard-coded demo)
* Mock website showing dashboard & alerts
* Guardian–Patient account link “gimmick” if needed
* Optional physical prototype or image mockup

---

## 🚀 Example Scenario

**Scenario 1 – Multi-Patient Monitoring**

1. Guardian creates an account and subscribes to several patients via their **UUID**.
2. Each patient’s IoT device streams vitals and location.
3. The backend interprets data:

   * If abnormal BPM > 120 + out-of-safe-zone → AI → ALERT.
4. Guardian dashboard shows:

   * ✅ *Safe* / ⚠️ *Alert* status
   * Patient location map
   * Real-time vitals
5. Blockchain logs each alert as an immutable proof.

---

## 📡 Communication Pipeline

```
[ESP32 Sensor Device]
   → MQTT Broker
       → Node.js Edge Node
           → OrbitDB/IPFS (replicated)
           → Smart Contract (hash log)
           → Guardian Dashboard (Next.js)
```

---

Would you like me to move on to **Step 2: Backend Architecture & Tech Breakdown** (how the Node.js + OrbitDB + Solidity + MQTT pieces talk to each other, including service structure and deployment flow)?
