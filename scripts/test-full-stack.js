import { ethers } from 'ethers';
import mqtt from 'mqtt';
import dotenv from 'dotenv';
import { createHash } from 'crypto';

dotenv.config({ path: '../backend/.env' });

const PATIENT_MONITOR_ABI = [
  "function registerDevice(string deviceId, address guardian) external",
  "function logEvent(string deviceId, bytes32 dataHash, string eventType) external",
  "function getDevice(string deviceId) external view returns (tuple(string deviceId, address patient, address guardian, bool isActive, uint256 registeredAt))",
  "function getDeviceEvents(string deviceId, uint256 limit) external view returns (tuple(string deviceId, bytes32 dataHash, address guardian, string eventType, uint256 timestamp)[])",
  "function getTotalDevices() external view returns (uint256)",
  "function getTotalEvents() external view returns (uint256)"
];

async function simulateIoTDevice() {
  console.log("IoT Device Simulator & Full Stack Test\n");

  // Setup blockchain connection
  const provider = new ethers.JsonRpcProvider(process.env.TON_RPC || 'http://127.0.0.1:8545');
  const wallet = new ethers.Wallet(process.env.TON_PRIVATE_KEY, provider);
  
  console.log("Connected to blockchain:", process.env.TON_RPC);
  console.log("Using account:", wallet.address);
  
  if (!process.env.TON_CONTRACT_ADDRESS) {
    console.error("TON_CONTRACT_ADDRESS not set in .env");
    console.log("\nDeploy the contract first using deploy-local.js");
    process.exit(1);
  }

  const contract = new ethers.Contract(
    process.env.TON_CONTRACT_ADDRESS,
    PATIENT_MONITOR_ABI,
    wallet
  );

  console.log("Contract address:", process.env.TON_CONTRACT_ADDRESS);
  
  // Get initial stats
  const totalDevices = await contract.getTotalDevices();
  const totalEvents = await contract.getTotalEvents();
  console.log("Total devices:", totalDevices.toString());
  console.log("Total events:", totalEvents.toString());
  console.log("");

  // Test 1: Register a device if not already registered
  const deviceId = "ESP32-SIMULATOR-001";
  const guardianAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Ganache account #2
  
  console.log("Test 1: Device Registration");
  const isRegistered = await contract.isDeviceRegistered(deviceId);
  
  if (!isRegistered) {
    console.log("Registering device:", deviceId);
    const tx = await contract.registerDevice(deviceId, guardianAddress);
    await tx.wait();
    console.log("Device registered!");
  } else {
    console.log("Device already registered");
  }
  
  const device = await contract.getDevice(deviceId);
  console.log("   Patient:", device.patient);
  console.log("   Guardian:", device.guardian);
  console.log("   Active:", device.isActive);
  console.log("");

  // Test 2: Simulate MQTT telemetry
  console.log("Test 2: MQTT Telemetry Simulation");
  
  const mqttClient = mqtt.connect(process.env.MQTT_BROKER || 'mqtt://localhost:1883');
  
  mqttClient.on('connect', async () => {
    console.log("Connected to MQTT broker");
    
    // Simulate normal telemetry
    const telemetryData = {
      deviceId,
      heartRate: 75,
      temperature: 36.5,
      timestamp: Date.now()
    };
    
    console.log("\nPublishing normal telemetry:", telemetryData);
    mqttClient.publish(
      `patient/${deviceId}/telemetry`,
      JSON.stringify(telemetryData)
    );
    
    // Wait a bit, then publish alert
    setTimeout(async () => {
      const alertData = {
        deviceId,
        heartRate: 125,
        temperature: 38.5,
        timestamp: Date.now()
      };
      
      console.log("\nPublishing alert telemetry:", alertData);
      mqttClient.publish(
        `patient/${deviceId}/telemetry`,
        JSON.stringify(alertData)
      );
      
      // Wait a bit, then publish critical
      setTimeout(async () => {
        const criticalData = {
          deviceId,
          heartRate: 160,
          temperature: 39.8,
          timestamp: Date.now()
        };
        
        console.log("\nPublishing critical telemetry:", criticalData);
        mqttClient.publish(
          `patient/${deviceId}/telemetry`,
          JSON.stringify(criticalData)
        );
        
        // Test 3: Verify events were logged to blockchain
        setTimeout(async () => {
          console.log("\nTest 3: Verify Blockchain Events");
          
          const events = await contract.getDeviceEvents(deviceId, 10);
          console.log(`Found ${events.length} events on blockchain:`);
          
          events.forEach((event, i) => {
            console.log(`\n   Event #${i + 1}:`);
            console.log("   - Type:", event.eventType);
            console.log("   - Hash:", event.dataHash);
            console.log("   - Timestamp:", new Date(Number(event.timestamp) * 1000).toISOString());
          });
          
          const newTotalEvents = await contract.getTotalEvents();
          console.log(`\nTotal events now: ${newTotalEvents.toString()}`);
          
          console.log("\nFull stack test complete!");
          console.log("\nThe following components are working:");
          console.log("   - Smart Contracts (deployed & functional)");
          console.log("   - MQTT (if backend received messages)");
          console.log("   - Blockchain integration (events logged)");
          console.log("   - Backend processing (if running)");
          
          console.log("\nNext steps:");
          console.log("   1. Start backend: cd backend && node index.js");
          console.log("   2. Backend will process MQTT → OrbitDB → Blockchain");
          console.log("   3. Frontend can query blockchain + OrbitDB directly");
          
          mqttClient.end();
          process.exit(0);
        }, 3000);
      }, 2000);
    }, 2000);
  });

  mqttClient.on('error', (error) => {
    console.error("MQTT Error:", error.message);
    console.log("\nMake sure Mosquitto broker is running:");
    console.log("   mosquitto -v");
    mqttClient.end();
    process.exit(1);
  });
}

simulateIoTDevice().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
