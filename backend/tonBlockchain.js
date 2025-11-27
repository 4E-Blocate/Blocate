import { ethers } from 'ethers'
import { config } from './config.js'
import { hashToBytes32 } from './utils/crypto.js'

let provider = null
let wallet = null
let contract = null
let isInitialized = false

// PatientMonitor contract ABI (essential functions only)
const CONTRACT_ABI = [
  "function registerDevice(string deviceId, address guardian, string fullName, uint8 age, string homeLocation) public",
  "function logEvent(string deviceId, bytes32 dataHash, string eventType) public",
  "function getDevice(string deviceId) public view returns (tuple(string deviceId, address patient, address guardian, string fullName, uint8 age, string homeLocation, bool isActive, uint256 registeredAt))",
  "function getDeviceEvents(string deviceId, uint256 limit) public view returns (tuple(string deviceId, bytes32 dataHash, address guardian, string eventType, uint256 timestamp)[])",
  "function isDeviceRegistered(string deviceId) public view returns (bool)",
  "function isDeviceActive(string deviceId) public view returns (bool)",
  "function setGuardianName(string name) public",
  "function getGuardianName(address guardian) public view returns (string)",
  "event DeviceRegistered(string indexed deviceId, address indexed patient, address indexed guardian, uint256 timestamp)",
  "event EventLogged(string indexed deviceId, address indexed guardian, bytes32 dataHash, string eventType, uint256 timestamp)",
  "event GuardianNameSet(address indexed guardian, string name, uint256 timestamp)"
]

/**
 * Initialize connection to TON blockchain
 */
export async function initBlockchain() {
  try {
    if (!config.TON_CONTRACT_ADDRESS || config.TON_CONTRACT_ADDRESS === '') {
      console.log('[WARN] Blockchain disabled: No contract address provided')
      return false
    }

    if (!config.TON_PRIVATE_KEY || config.TON_PRIVATE_KEY === '') {
      console.log('[WARN] Blockchain disabled: No private key provided')
      return false
    }

    console.log('[INFO] Connecting to TON blockchain...')
    console.log(`[INFO] RPC: ${config.TON_RPC}`)

    // Create provider
    provider = new ethers.JsonRpcProvider(config.TON_RPC)
    
    // Create wallet
    wallet = new ethers.Wallet(config.TON_PRIVATE_KEY, provider)
    
    // Get network info
    const network = await provider.getNetwork()
    const balance = await provider.getBalance(wallet.address)
    
    console.log(`[INFO] Connected to network: ${network.name} (Chain ID: ${network.chainId})`)
    console.log(`[INFO] Wallet: ${wallet.address}`)
    console.log(`[INFO] Balance: ${ethers.formatEther(balance)} ETH`)

    // Initialize contract
    contract = new ethers.Contract(
      config.TON_CONTRACT_ADDRESS,
      CONTRACT_ABI,
      wallet
    )

    console.log(`[INFO] Contract initialized: ${config.TON_CONTRACT_ADDRESS}`)
    
    isInitialized = true
    return true

  } catch (error) {
    console.error('[ERROR] Blockchain initialization failed:', error.message)
    return false
  }
}

/**
 * Log event hash to blockchain
 * @param {string} deviceId  Device ID
 * @param {Object} eventData  Full event data (will be hashed)
 * @param {string} eventType  "normal", "alert", or "critical"
 * @returns {Promise<Object>} Transaction receipt
 */
export async function logEventToChain(deviceId, eventData, eventType) {
  if (!isInitialized) {
    throw new Error('Blockchain not initialized')
  }

  try {
    // Generate hash of event data
    const dataHash = hashToBytes32(eventData)
    
    console.log(`[INFO] Logging event to blockchain...`)
    console.log(`[INFO] Device: ${deviceId}`)
    console.log(`[INFO] Type: ${eventType}`)
    console.log(`[INFO] Hash: ${dataHash}`)

    // Call smart contract
    const tx = await contract.logEvent(deviceId, dataHash, eventType)
    console.log(`[INFO] Tx submitted: ${tx.hash}`)

    // Wait for confirmation
    const receipt = await tx.wait()
    console.log(`[INFO] Event logged on-chain (Block: ${receipt.blockNumber})`)

    return {
      success: true,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      dataHash,
      gasUsed: receipt.gasUsed.toString()
    }

  } catch (error) {
    console.error('[ERROR] Failed to log event on-chain:', error.message)
    
    // Check specific errors
    if (error.message.includes('Device not registered')) {
      console.error('   Device must be registered first')
    } else if (error.message.includes('Device is not active')) {
      console.error('   Device has been deactivated')
    }

    throw error
  }
}

/**
 * Register a new device onchain
 * @param {string} deviceId  Device UUID
 * @param {string} guardianAddress  Guardian wallet address
 * @param {string} fullName Patient's full name
 * @param {number} age Patient's age
 * @param {string} homeLocation Patient's home GPS coordinates "lat,long"
 * @returns {Promise<Object>} Transaction receipt
 */
export async function registerDeviceOnChain(deviceId, guardianAddress, fullName, age, homeLocation) {
  if (!isInitialized) {
    throw new Error('Blockchain not initialized')
  }

  try {
    console.log(`[INFO] Registering device on blockchain...`)
    console.log(`[INFO] Device: ${deviceId}`)
    console.log(`[INFO] Guardian: ${guardianAddress}`)
    console.log(`[INFO] Patient: ${fullName} (${age})`)
    console.log(`[INFO] Home: ${homeLocation}`)

    const tx = await contract.registerDevice(deviceId, guardianAddress, fullName, age, homeLocation)
    console.log(`[INFO] Tx submitted: ${tx.hash}`)

    const receipt = await tx.wait()
    console.log(`[INFO] Device registered on-chain (Block: ${receipt.blockNumber})`)

    return {
      success: true,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    }

  } catch (error) {
    console.error('[ERROR] Failed to register device:', error.message)
    
    if (error.message.includes('Device already registered')) {
      console.log('[INFO] Device already exists on-chain')
    }

    throw error
  }
}

/**
 * Check if device is registered onchain
 * @param {string} deviceId  Device UUID
 * @returns {Promise<boolean>} True if registered
 */
export async function isDeviceRegistered(deviceId) {
  if (!isInitialized) {
    return false
  }

  try {
    return await contract.isDeviceRegistered(deviceId)
  } catch (error) {
    console.error(`Failed to check device registration: ${error.message}`)
    return false
  }
}

/**
 * Get device info from blockchain
 * @param {string} deviceId  Device UUID
 * @returns {Promise<Object>} Device information
 */
export async function getDeviceInfo(deviceId) {
  if (!isInitialized) {
    throw new Error('Blockchain not initialized')
  }

  try {
    const device = await contract.getDevice(deviceId)
    
    return {
      deviceId: device.deviceId,
      patient: device.patient,
      guardian: device.guardian,
      fullName: device.fullName,
      age: Number(device.age),
      homeLocation: device.homeLocation,
      isActive: device.isActive,
      registeredAt: Number(device.registeredAt)
    }
  } catch (error) {
    console.error(`Failed to get device info: ${error.message}`)
    throw error
  }
}

/**
 * Get recent events for a device from blockchain
 * @param {string} deviceId  Device UUID
 * @param {number} limit  Number of events to fetch
 * @returns {Promise<Array>} Array of events
 */
export async function getDeviceEventsFromChain(deviceId, limit = 10) {
  if (!isInitialized) {
    throw new Error('Blockchain not initialized')
  }

  try {
    const events = await contract.getDeviceEvents(deviceId, limit)
    
    return events.map(e => ({
      deviceId: e.deviceId,
      dataHash: e.dataHash,
      guardian: e.guardian,
      eventType: e.eventType,
      timestamp: Number(e.timestamp)
    }))
  } catch (error) {
    console.error(`Failed to get device events: ${error.message}`)
    throw error
  }
}

/**
 * Listen to blockchain events (realtime)
 */
export function watchBlockchainEvents(callback) {
  if (!isInitialized || !contract) {
    console.warn('Cannot watch events: blockchain not initialized')
    return null
  }

  // Listen for EventLogged events
  contract.on('EventLogged', (deviceId, guardian, dataHash, eventType, timestamp, event) => {
    console.log(`Blockchain event detected:`)
    console.log(`   Device: ${deviceId}`)
    console.log(`   Type: ${eventType}`)
    console.log(`   Hash: ${dataHash}`)
    
    if (callback) {
      callback({
        deviceId,
        guardian,
        dataHash,
        eventType,
        timestamp: Number(timestamp),
        blockNumber: event.log.blockNumber,
        txHash: event.log.transactionHash
      })
    }
  })

  console.log('[INFO] Listening for blockchain events...')
}

/**
 * Get blockchain connection status
 */
export function getBlockchainStatus() {
  return {
    initialized: isInitialized,
    walletAddress: wallet ? wallet.address : null,
    contractAddress: config.TON_CONTRACT_ADDRESS,
    rpcUrl: config.TON_RPC
  }
}

/**
 * Cleanup blockchain connection
 */
export async function closeBlockchain() {
  if (contract) {
    contract.removeAllListeners()
  }
  
  if (provider) {
    await provider.destroy()
  }
  
  isInitialized = false
  console.log('Blockchain connection closed')
}

/**
 * Set guardian display name
 * @param {string} name  Display name for the guardian
 * @returns {Promise<boolean>}
 */
export async function setGuardianName(name) {
  if (!isInitialized) {
    console.log('[ERROR] Blockchain not initialized')
    return false
  }

  try {
    console.log(`[INFO] Setting guardian name: ${name}`)
    
    const tx = await contract.setGuardianName(name)
    console.log(`[INFO] Transaction sent: ${tx.hash}`)
    
    const receipt = await tx.wait()
    console.log(`[INFO] Guardian name set successfully (Block: ${receipt.blockNumber})`)
    
    return true
  } catch (error) {
    console.error('[ERROR] Failed to set guardian name:', error.message)
    return false
  }
}

/**
 * Get guardian display name
 * @param {string} guardianAddress  Guardian wallet address
 * @returns {Promise<string|null>}
 */
export async function getGuardianName(guardianAddress) {
  if (!isInitialized) {
    console.log('[ERROR] Blockchain not initialized')
    return null
  }

  try {
    const name = await contract.getGuardianName(guardianAddress)
    return name || null
  } catch (error) {
    console.error('[ERROR] Failed to get guardian name:', error.message)
    return null
  }
}

export default {
  initBlockchain,
  logEventToChain,
  registerDeviceOnChain,
  isDeviceRegistered,
  getDeviceInfo,
  getDeviceEventsFromChain,
  watchBlockchainEvents,
  getBlockchainStatus,
  closeBlockchain,
  setGuardianName,
  getGuardianName
}
