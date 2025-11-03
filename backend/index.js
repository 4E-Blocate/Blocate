#!/usr/bin/env node

import { config, validateConfig } from './config.js'
import { initBlockchain, closeBlockchain, getBlockchainStatus } from './tonBlockchain.js'
import { initMQTT, closeMQTT, getMQTTStatus } from './mqttClient.js'
import { initStorage, closeStorage, getStorageStatus, getDatabaseAddress } from './orbitdbClient.js'
import { processTelemetry, processAlert, validateTelemetryData } from './logic.js'
import { getAIStatus } from './aiClient.js'

// State
let isRunning = false

/**
 * Handle incoming MQTT messages
 */
async function handleMQTTMessage(topic, payload) {
  try {
    // Validate data
    if (!validateTelemetryData(payload)) {
      console.error('❌ Invalid telemetry data received')
      return
    }

    // Route based on topic
    if (topic.includes('/telemetry')) {
      await processTelemetry(payload)
    } else if (topic.includes('/alert')) {
      await processAlert(payload)
    }

  } catch (error) {
    console.error('❌ Error handling MQTT message:', error.message)
  }
}

/**
 * Initialize all DePIN node components
 */
async function initializeDePINNode() {
  try {
    console.log('\n╔════════════════════════════════════════════════╗')
    console.log('║   🏥 Patient Guardian DePIN Node v1.0          ║')
    console.log('║   Decentralized IoT Health Monitoring          ║')
    console.log('╚════════════════════════════════════════════════╝\n')

    console.log(`📍 Node ID: ${config.NODE_ID}`)
    console.log(`🌐 Environment: ${config.NODE_ENV}\n`)

    // Validate configuration
    console.log('🔍 Validating configuration...')
    const configErrors = validateConfig()
    if (configErrors.length > 0) {
      configErrors.forEach(err => console.log(err))
      console.log()
    }

    // Initialize storage layer (OrbitDB + IPFS)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Stage 1: Decentralized Storage')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    await initStorage()

    // Initialize blockchain layer
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Stage 2: Blockchain Integration')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    await initBlockchain()

    // Initialize MQTT client
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Stage 3: IoT Communication Layer')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    await initMQTT(handleMQTTMessage)

    // Display status
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ DePIN Node Status')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const storageStatus = getStorageStatus()
    const blockchainStatus = getBlockchainStatus()
    const mqttStatus = getMQTTStatus()
    const aiStatus = getAIStatus()

    console.log(`\n📦 Storage:`)
    console.log(`   IPFS: ${storageStatus.ipfsId ? '✅ Active' : '❌ Inactive'}`)
    console.log(`   OrbitDB: ${storageStatus.orbitdbAddress ? '✅ Connected' : '❌ Not connected'}`)
    if (storageStatus.orbitdbAddress) {
      console.log(`   Address: ${storageStatus.orbitdbAddress}`)
      console.log(`   Events stored: ${storageStatus.eventCount}`)
    }

    console.log(`\n⛓️  Blockchain:`)
    console.log(`   Status: ${blockchainStatus.initialized ? '✅ Connected' : '❌ Not connected'}`)
    if (blockchainStatus.initialized) {
      console.log(`   Network: TON (EVM)`)
      console.log(`   Wallet: ${blockchainStatus.walletAddress}`)
      console.log(`   Contract: ${blockchainStatus.contractAddress}`)
    }

    console.log(`\n📡 MQTT:`)
    console.log(`   Status: ${mqttStatus.connected ? '✅ Connected' : '❌ Not connected'}`)
    console.log(`   Broker: ${mqttStatus.broker}`)
    console.log(`   Topics: patient/+/telemetry, patient/+/alert`)

    console.log(`\n🤖 AI:`)
    console.log(`   Status: ${aiStatus.enabled && aiStatus.configured ? '✅ Enabled' : '⚠️  Disabled'}`)
    if (aiStatus.enabled) {
      console.log(`   Provider: ${aiStatus.provider}`)
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🚀 DePIN Node Running')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('👂 Listening for IoT device telemetry...')
    console.log('💡 Frontend can query data from:')
    console.log(`   - OrbitDB: ${storageStatus.orbitdbAddress || 'N/A'}`)
    console.log(`   - TON Contract: ${blockchainStatus.contractAddress || 'N/A'}`)
    console.log('\n📝 Test with:')
    console.log(`   mosquitto_pub -h localhost -t "patient/test-001/telemetry" -m '{"deviceId":"test-001","bpm":75,"temp":36.5,"gps":"0,0","timestamp":${Date.now()}}'`)
    console.log('\n⏸️  Press Ctrl+C to stop\n')

    isRunning = true

  } catch (error) {
    console.error('\n❌ Failed to initialize DePIN node:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

/**
 * Graceful shutdown
 */
async function shutdown() {
  if (!isRunning) return

  console.log('\n\n⚠️  Shutting down DePIN node...')
  isRunning = false

  try {
    await closeMQTT()
    await closeStorage()
    await closeBlockchain()
    
    console.log('✅ DePIN node stopped gracefully\n')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message)
    process.exit(1)
  }
}

// Handle shutdown signals
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error)
  shutdown()
})

// Start the DePIN node
initializeDePINNode()
