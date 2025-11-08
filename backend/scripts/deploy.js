import hre from "hardhat";

async function main() {
  console.log("Starting deployment...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy PatientMonitor (which deploys DeviceRegistry and EventLogger)
  console.log("Deploying PatientMonitor contract...");
  const PatientMonitor = await hre.ethers.getContractFactory("PatientMonitor");
  const patientMonitor = await PatientMonitor.deploy();
  
  await patientMonitor.waitForDeployment();
  const patientMonitorAddress = await patientMonitor.getAddress();
  
  console.log("PatientMonitor deployed to:", patientMonitorAddress);

  // Get sub-contract addresses
  const [deviceRegistryAddress, eventLoggerAddress] = await patientMonitor.getContractAddresses();
  
  console.log("DeviceRegistry deployed to:", deviceRegistryAddress);
  console.log("EventLogger deployed to:", eventLoggerAddress);

  console.log("\nDeployment Summary:");
  console.log("========================");
  console.log("PatientMonitor:", patientMonitorAddress);
  console.log("DeviceRegistry:", deviceRegistryAddress);
  console.log("EventLogger:", eventLoggerAddress);
  
  console.log("\nAdd this to your backend/.env file:");
  console.log(`TON_CONTRACT_ADDRESS=${patientMonitorAddress}`);
  
  console.log("\nDeployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
