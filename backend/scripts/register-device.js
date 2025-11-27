import hre from "hardhat";

async function main() {
  console.log("Registering Device on Sepolia\n");

  // Configuration
  const deviceId = "patient-001";
  const contractAddress = process.env.TON_CONTRACT_ADDRESS;
  const guardianAddress = "0x81f1cD1E0B31C8B89C6616abf2FdE7fc380fF921"; // Backend wallet

  if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
    console.error("❌ TON_CONTRACT_ADDRESS not set in .env file");
    process.exit(1);
  }

  // Get signer (backend wallet)
  const [signer] = await hre.ethers.getSigners();
  console.log("Using wallet:", signer.address);
  
  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log("Wallet balance:", hre.ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.error("\n❌ Wallet has no Sepolia ETH!");
    console.error("Get free Sepolia ETH from: https://sepoliafaucet.com/");
    process.exit(1);
  }
  
  console.log("");

  // Connect to deployed contract
  console.log("Connecting to PatientMonitor at:", contractAddress);
  const PatientMonitor = await hre.ethers.getContractFactory("PatientMonitor");
  const patientMonitor = PatientMonitor.attach(contractAddress);

  // Check if device is already registered
  try {
    const existingDevice = await patientMonitor.getDevice(deviceId);
    if (existingDevice.isActive) {
      console.log("\n⚠️  Device already registered:");
      console.log("   Device ID:", existingDevice.deviceId);
      console.log("   Patient:", existingDevice.patient);
      console.log("   Guardian:", existingDevice.guardian);
      console.log("   Active:", existingDevice.isActive);
      console.log("\nNo need to register again.");
      return;
    }
  } catch (error) {
    // Device not registered, continue
  }

  // Register device
  console.log("\nRegistering device:", deviceId);
  console.log("Patient (caller):", signer.address);
  console.log("Guardian:", guardianAddress);
  
  try {
    const tx = await patientMonitor.registerDevice(deviceId, guardianAddress);
    console.log("\nTransaction sent:", tx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Device registered successfully!");
    console.log("   Block:", receipt.blockNumber);
    console.log("   Gas used:", receipt.gasUsed.toString());

    // Verify registration
    const device = await patientMonitor.getDevice(deviceId);
    console.log("\nDevice Details:");
    console.log("   Device ID:", device.deviceId);
    console.log("   Patient:", device.patient);
    console.log("   Guardian:", device.guardian);
    console.log("   Active:", device.isActive);
    
  } catch (error) {
    console.error("\n❌ Registration failed:", error.message);
    if (error.message.includes("device already registered")) {
      console.log("\nDevice is already registered. To change guardian, use the changeGuardian function.");
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
