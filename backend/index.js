#!/usr/bin/env node

import { config, validateConfig } from './config.js'
import { initBlockchain, closeBlockchain, getBlockchainStatus } from './tonBlockchain.js'
import { initMQTT, closeMQTT, getMQTTStatus } from './mqttClient.js'
import { initStorage, closeStorage, getStorageStatus } from './gunClient.js'
import { processTelemetry, processAlert, validateTelemetryData } from './logic.js'
import { getAIStatus } from './aiClient.js'
import { 
  initWebSocketNotifications, 
  closeNotifications,
  registerGuardianContacts 
} from './notificationService.js'
import http from 'http'

// State
let isRunning = false
let httpServer = null

/**
 * Handle incoming MQTT messages
 */
async function handleMQTTMessage(topic, payload) {
  try {
    // Validate data
    if (!validateTelemetryData(payload)) {
      console.error('Invalid telemetry data received')
      return
    }

    // Route based on topic
    if (topic.includes('/telemetry')) {
      await processTelemetry(payload)
    } else if (topic.includes('/alert')) {
      await processAlert(payload)
    }

  } catch (error) {
    console.error('Error handling MQTT message:', error.message)
  }
}

/**
 * Initialize all DePIN node components
 */
async function initializeDePINNode() {
  try {
    console.log('\n════════════════════════════════════════════════')
    console.log('  Patient Guardian DePIN Node v1.0')
    console.log('  Decentralized IoT Health Monitoring')
    console.log('════════════════════════════════════════════════\n')

    console.log(`Node ID: ${config.NODE_ID}`)
    console.log(`Environment: ${config.NODE_ENV}\n`)

    // Validate configuration
    console.log('Validating configuration...')
    const configErrors = validateConfig()
    if (configErrors.length > 0) {
      configErrors.forEach(err => console.log(err))
      console.log()
    }

    // Initialize storage layer (GunDB)
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

    // Initialize notification services
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Stage 4: Guardian Notification System')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Create HTTP server for WebSocket
    if (config.WEBSOCKET_ENABLED) {
      httpServer = http.createServer()
      initWebSocketNotifications(httpServer)
      httpServer.listen(config.WEBSOCKET_PORT, () => {
        console.log(`WebSocket server listening on port ${config.WEBSOCKET_PORT}`)
      })
    }

    // Display status
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('DePIN Node Status')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const storageStatus = getStorageStatus()
    const blockchainStatus = getBlockchainStatus()
    const mqttStatus = getMQTTStatus()
    const aiStatus = getAIStatus()

    console.log(`\nStorage:`)
    console.log(`   Engine: ${storageStatus.engine}`)
    console.log(`   Status: ${storageStatus.initialized ? 'Active' : 'Inactive'}`)

    console.log(`\nBlockchain:`)
    console.log(`   Status: ${blockchainStatus.initialized ? 'Connected' : 'Not connected'}`)
    if (blockchainStatus.initialized) {
      console.log(`   Network: TON (EVM)`)
      console.log(`   Wallet: ${blockchainStatus.walletAddress}`)
      console.log(`   Contract: ${blockchainStatus.contractAddress}`)
    }

    console.log(`\nMQTT:`)
    console.log(`   Status: ${mqttStatus.connected ? 'Connected' : 'Not connected'}`)
    console.log(`   Broker: ${mqttStatus.broker}`)
    console.log(`   Topics: patient/+/telemetry, patient/+/alert`)

    console.log(`\nAI:`)
    console.log(`   Status: ${aiStatus.enabled && aiStatus.configured ? 'Enabled' : 'Disabled'}`)
    if (aiStatus.enabled) {
      console.log(`   Provider: ${aiStatus.provider}`)
    }

    console.log(`\nNotifications:`)
    console.log(`   WebSocket: ${config.WEBSOCKET_ENABLED ? `Enabled (port ${config.WEBSOCKET_PORT})` : 'Disabled'}`)
    console.log(`   Telegram: ${config.TELEGRAM_ENABLED ? 'Enabled (all alerts → admin)' : 'Disabled'}`)

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('DePIN Node Running')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('\nListening for IoT device telemetry...')
    console.log('Frontend can query data from:')
    console.log(`   - GunDB: Local P2P storage`)
    console.log(`   - TON Contract: ${blockchainStatus.contractAddress || 'N/A'}`)
    console.log('\nTest with:')
    console.log(`   mosquitto_pub -h localhost -t "patient/test-001/telemetry" -m '{"deviceId":"test-001","bpm":75,"temp":36.5,"gps":"0,0","timestamp":${Date.now()}}'`)
    console.log('\nPress Ctrl+C to stop\n')

    isRunning = true

  } catch (error) {
    console.error('\nFailed to initialize DePIN node:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

/**
 * Graceful shutdown
 */
async function shutdown() {
  if (!isRunning) return

  console.log('\n\nShutting down DePIN node...')
  isRunning = false

  try {
    await closeMQTT()
    await closeStorage()
    await closeBlockchain()
    await closeNotifications()
    
    if (httpServer) {
      httpServer.close()
    }
    
    console.log('DePIN node stopped gracefully\n')
    process.exit(0)
  } catch (error) {
    console.error('Error during shutdown:', error.message)
    process.exit(1)
  }
}

// Handle shutdown signals
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error)
  shutdown()
})

// Start the DePIN node
initializeDePINNode()
