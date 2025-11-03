import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

export const config = {
  // Node Identity
  NODE_ID: process.env.NODE_ID || `depin-node-${Date.now()}`,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // MQTT Configuration
  MQTT_BROKER: process.env.MQTT_BROKER || 'mqtt://localhost:1883',
  MQTT_USERNAME: process.env.MQTT_USERNAME || '',
  MQTT_PASSWORD: process.env.MQTT_PASSWORD || '',

  // IPFS Configuration
  IPFS_REPO: process.env.IPFS_REPO || './ipfs-repo',

  // OrbitDB Configuration
  ORBITDB_DIRECTORY: process.env.ORBITDB_DIRECTORY || './orbitdb-data',
  ORBITDB_ADDRESS: process.env.ORBITDB_ADDRESS || '', // Shared address for multi-node

  // TON Blockchain
  TON_RPC: process.env.TON_RPC || 'https://testnet.toncenter.com/api/v2/jsonRPC',
  TON_PRIVATE_KEY: process.env.TON_PRIVATE_KEY || '',
  TON_CONTRACT_ADDRESS: process.env.TON_CONTRACT_ADDRESS || '',

  // AI Configuration
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_API_URL: process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  AI_ENABLED: process.env.AI_ENABLED === 'true',
  AI_FALLBACK_MESSAGE: process.env.AI_FALLBACK_MESSAGE || 'AI Unavailable'
}

// Validation
export function validateConfig() {
  const errors = []

  if (!config.TON_CONTRACT_ADDRESS || config.TON_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
    errors.push('⚠️  TON_CONTRACT_ADDRESS not set - blockchain logging disabled')
  }

  if (!config.TON_PRIVATE_KEY) {
    errors.push('⚠️  TON_PRIVATE_KEY not set - cannot sign transactions')
  }

  if (config.AI_ENABLED && !config.GEMINI_API_KEY) {
    errors.push('⚠️  AI_ENABLED but GEMINI_API_KEY not set - AI will be disabled')
    config.AI_ENABLED = false
  }

  return errors
}

export default config
