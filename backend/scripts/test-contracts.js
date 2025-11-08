import hre from "hardhat";

async function main() {
  console.log("Testing Smart Contracts\n");

  // Get test accounts
  const [patient, guardian, backend] = await hre.ethers.getSigners();
  console.log("Patient address:", patient.address);
  console.log("Guardian address:", guardian.address);
  console.log("Backend node address:", backend.address);
  console.log("");

  // Deploy contracts
  console.log("Deploying PatientMonitor...");
  const PatientMonitor = await hre.ethers.getContractFactory("PatientMonitor");
  const patientMonitor = await PatientMonitor.deploy();
  await patientMonitor.waitForDeployment();
  const contractAddress = await patientMonitor.getAddress();
  console.log("Deployed to:", contractAddress);
  console.log("");

  // Test 1: Register Device
  console.log("Test 1: Registering device...");
  const deviceId = "ESP32-TEST-001";
  const tx1 = await patientMonitor.connect(patient).registerDevice(deviceId, guardian.address);
  await tx1.wait();
  console.log("Device registered!");

  // Verify registration
  const device = await patientMonitor.getDevice(deviceId);
  console.log("   Device ID:", device.deviceId);
  console.log("   Patient:", device.patient);
  console.log("   Guardian:", device.guardian);
  console.log("   Active:", device.isActive);
  console.log("");

  // Test 2: Log Normal Event
  console.log("Test 2: Logging normal event...");
  const normalHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(JSON.stringify({
    deviceId,
    heartRate: 75,
    temperature: 36.5,
    timestamp: Date.now()
  })));
  
  const tx2 = await patientMonitor.connect(backend).logEvent(deviceId, normalHash, "normal");
  await tx2.wait();
  console.log("Normal event logged!");
  console.log("   Event hash:", normalHash);
  console.log("");

  // Test 3: Log Alert Event
  console.log("Test 3: Logging alert event...");
  const alertHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(JSON.stringify({
    deviceId,
    heartRate: 125,
    temperature: 38.2,
    timestamp: Date.now()
  })));
  
  const tx3 = await patientMonitor.connect(backend).logEvent(deviceId, alertHash, "alert");
  await tx3.wait();
  console.log("Alert event logged!");
  console.log("   Event hash:", alertHash);
  console.log("");

  // Test 4: Log Critical Event
  console.log("Test 4: Logging critical event...");
  const criticalHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(JSON.stringify({
    deviceId,
    heartRate: 155,
    temperature: 39.5,
    timestamp: Date.now()
  })));
  
  const tx4 = await patientMonitor.connect(backend).logEvent(deviceId, criticalHash, "critical");
  await tx4.wait();
  console.log("Critical event logged!");
  console.log("   Event hash:", criticalHash);
  console.log("");

  // Test 5: Get Device Events
  console.log("Test 5: Retrieving device events...");
  const events = await patientMonitor.getDeviceEvents(deviceId, 10);
  console.log(`Found ${events.length} events for device ${deviceId}`);
  
  events.forEach((event, index) => {
    console.log(`\n   Event #${index + 1}:`);
    console.log("   - Type:", event.eventType);
    console.log("   - Hash:", event.dataHash);
    console.log("   - Guardian:", event.guardian);
    console.log("   - Timestamp:", new Date(Number(event.timestamp) * 1000).toISOString());
  });
  console.log("");

  // Test 6: Change Guardian
  console.log("Test 6: Changing guardian...");
  const [, , , newGuardian] = await hre.ethers.getSigners();
  const tx5 = await patientMonitor.connect(patient).changeGuardian(deviceId, newGuardian.address);
  await tx5.wait();
  console.log("Guardian changed to:", newGuardian.address);
  console.log("");

  // Test 7: Get Statistics
  console.log("🧪 Test 7: Getting statistics...");
  const totalDevices = await patientMonitor.getTotalDevices();
  const totalEvents = await patientMonitor.getTotalEvents();
  console.log("✅ Total devices:", totalDevices.toString());
  console.log("✅ Total events:", totalEvents.toString());
  console.log("");

  // Test 8: Deactivate Device
  console.log("🧪 Test 8: Deactivating device...");
  const tx6 = await patientMonitor.connect(patient).deactivateDevice(deviceId);
  await tx6.wait();
  const isActive = await patientMonitor.isDeviceActive(deviceId);
  console.log("✅ Device active status:", isActive);
  console.log("");

  console.log("🎉 All tests passed successfully!");
  console.log("\n💡 Contract is ready for integration with your backend!");
  console.log("   Use this address in .env: TON_CONTRACT_ADDRESS=" + contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
