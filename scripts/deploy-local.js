import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Contract ABIs (simplified - only what backend needs)
const PATIENT_MONITOR_ABI = [
  "function registerDevice(string deviceId, address guardian) external",
  "function logEvent(string deviceId, bytes32 dataHash, string eventType) external",
  "function getDevice(string deviceId) external view returns (tuple(string deviceId, address patient, address guardian, bool isActive, uint256 registeredAt))",
  "function getDeviceEvents(string deviceId, uint256 limit) external view returns (tuple(string deviceId, bytes32 dataHash, address guardian, string eventType, uint256 timestamp)[])",
  "function isDeviceRegistered(string deviceId) external view returns (bool)",
  "function isDeviceActive(string deviceId) external view returns (bool)",
  "function getTotalDevices() external view returns (uint256)",
  "function getTotalEvents() external view returns (uint256)",
  "function getContractAddresses() external view returns (address, address)"
];

async function main() {
  console.log("Deploying Contracts to Local Blockchain\n");

  // Connect to local Ganache
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  
  // Use first Ganache account as deployer
  const deployer = new ethers.Wallet(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', // Ganache default private key
    provider
  );
  
  console.log("Deploying with account:", deployer.address);
  const balance = await provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH\n");

  // Read compiled contract
  const contractsPath = path.join(__dirname, '..', 'backend', 'contracts');
  
  // Read all Solidity files and compile them inline
  const IDeviceRegistry = fs.readFileSync(path.join(contractsPath, 'IDeviceRegistry.sol'), 'utf8');
  const IEventLogger = fs.readFileSync(path.join(contractsPath, 'IEventLogger.sol'), 'utf8');
  const DeviceRegistry = fs.readFileSync(path.join(contractsPath, 'DeviceRegistry.sol'), 'utf8');
  const EventLogger = fs.readFileSync(path.join(contractsPath, 'EventLogger.sol'), 'utf8');
  const PatientMonitor = fs.readFileSync(path.join(contractsPath, 'PatientMonitor.sol'), 'utf8');

  console.log("Contract files loaded");
  console.log("Note: Using pre-compiled bytecode (compile in Remix first)\n");
  
  console.log("=" .repeat(60));
  console.log("DEPLOYMENT INSTRUCTIONS:");
  console.log("=" .repeat(60));
  console.log("\n1. Go to https://remix.ethereum.org");
  console.log("\n2. Create these files and paste the code from backend/contracts/:");
  console.log("   - IDeviceRegistry.sol");
  console.log("   - IEventLogger.sol");
  console.log("   - DeviceRegistry.sol");
  console.log("   - EventLogger.sol");
  console.log("   - PatientMonitor.sol");
  console.log("\n3. Compile PatientMonitor.sol (Solidity 0.8.20)");
  console.log("\n4. Deploy & Run:");
  console.log("   - Environment: Injected Provider - MetaMask");
  console.log("   - Connect MetaMask to: http://127.0.0.1:8545");
  console.log("   - Import this account to MetaMask:");
  console.log("     Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  console.log("   - Deploy PatientMonitor");
  console.log("   - Copy the deployed contract address");
  console.log("\n5. Add to backend/.env:");
  console.log("   TON_CONTRACT_ADDRESS=<deployed_address>");
  console.log("   TON_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  console.log("   TON_RPC=http://127.0.0.1:8545");
  console.log("\n" + "=" .repeat(60));
  
  // Save ABI for backend
  const abiPath = path.join(__dirname, '..', 'backend', 'PatientMonitor.abi.json');
  fs.writeFileSync(abiPath, JSON.stringify(PATIENT_MONITOR_ABI, null, 2));
  console.log("\nABI saved to:", abiPath);
  
  console.log("\nAlternative: Use the automated test script below\n");
}

main()
  .then(() => {
    console.log("\n🎯 Next: Start Ganache and deploy contracts");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
