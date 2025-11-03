import { create as createIPFS } from 'ipfs'
import OrbitDB from 'orbit-db'
import { config } from './config.js'

let ipfsInstance = null
let orbitdb = null
let eventDB = null
let isInitialized = false

/**
 * Initialize IPFS + OrbitDB
 */
export async function initStorage() {
  try {
    console.log('📦 Initializing decentralized storage...')

    // Initialize IPFS
    console.log('   Starting IPFS node...')
    ipfsInstance = await createIPFS({
      repo: config.IPFS_REPO,
      config: {
        Bootstrap: [],
        Addresses: { Swarm: [] }
      },
      offline: false,
      EXPERIMENTAL: { pubsub: true }
    })

    const nodeId = await ipfsInstance.id()
    const nodeIdStr = typeof nodeId.id === 'string' ? nodeId.id : nodeId.id.toString()
    console.log(`✅ IPFS initialized (ID: ${nodeIdStr.substring(0, 16)}...)`)

    // Initialize OrbitDB
    console.log('   Starting OrbitDB...')
    orbitdb = await OrbitDB.createInstance(ipfsInstance, {
      directory: config.ORBITDB_DIRECTORY
    })
    console.log(`✅ OrbitDB initialized`)

    // Open or create event database
    if (config.ORBITDB_ADDRESS) {
      console.log(`   Connecting to shared database: ${config.ORBITDB_ADDRESS}`)
      eventDB = await orbitdb.eventlog(config.ORBITDB_ADDRESS)
    } else {
      console.log('   Creating new event database...')
      eventDB = await orbitdb.eventlog('patient-events', {
        accessController: { write: ['*'] },
        replicate: true
      })
    }

    await eventDB.load()
    
    const eventCount = eventDB.iterator({ limit: -1 }).collect().length
    console.log(`✅ Event database ready`)
    console.log(`   Address: ${eventDB.address.toString()}`)
    console.log(`   Events: ${eventCount}`)

    // Setup replication events
    eventDB.events.on('replicated', (address) => {
      console.log(`🔄 Data replicated from peer: ${address}`)
    })

    eventDB.events.on('write', (address, entry) => {
      console.log(`✍️  New entry written: ${entry.hash.substring(0, 16)}...`)
    })

    isInitialized = true
    return true

  } catch (error) {
    console.error('❌ Storage initialization failed:', error.message)
    throw error
  }
}

/**
 * Store event in OrbitDB
 * @param {Object} eventData - Event data to store
 * @returns {Promise<string>} Entry hash
 */
export async function storeEvent(eventData) {
  if (!isInitialized || !eventDB) {
    throw new Error('Storage not initialized')
  }

  try {
    const enrichedEvent = {
      ...eventData,
      node: config.NODE_ID,
      storedAt: Date.now()
    }

    const hash = await eventDB.add(enrichedEvent)
    console.log(`💾 Event stored in OrbitDB: ${hash.substring(0, 16)}...`)

    return hash

  } catch (error) {
    console.error('❌ Failed to store event:', error.message)
    throw error
  }
}

/**
 * Get all events from OrbitDB
 * @param {number} limit - Max number of events to return
 * @returns {Array} Array of events
 */
export function getAllEvents(limit = 100) {
  if (!isInitialized || !eventDB) {
    throw new Error('Storage not initialized')
  }

  const events = eventDB
    .iterator({ limit: limit > 0 ? limit : -1 })
    .collect()
    .reverse()

  return events.map(e => ({
    hash: e.hash,
    data: e.payload.value,
    timestamp: e.payload.value.timestamp || e.payload.value.storedAt
  }))
}

/**
 * Get events for specific device
 * @param {string} deviceId - Device UUID
 * @param {number} limit - Max number of events
 * @returns {Array} Device events
 */
export function getDeviceEvents(deviceId, limit = 50) {
  if (!isInitialized || !eventDB) {
    throw new Error('Storage not initialized')
  }

  const allEvents = eventDB
    .iterator({ limit: -1 })
    .collect()
    .filter(e => e.payload.value.deviceId === deviceId)
    .reverse()
    .slice(0, limit)

  return allEvents.map(e => ({
    hash: e.hash,
    data: e.payload.value,
    timestamp: e.payload.value.timestamp || e.payload.value.storedAt
  }))
}

/**
 * Get OrbitDB address for peer connection
 * @returns {string} OrbitDB address
 */
export function getDatabaseAddress() {
  if (!eventDB) return null
  return eventDB.address.toString()
}

/**
 * Get storage status
 */
export function getStorageStatus() {
  return {
    initialized: isInitialized,
    ipfsId: ipfsInstance ? 'active' : null,
    orbitdbAddress: getDatabaseAddress(),
    eventCount: eventDB ? eventDB.iterator({ limit: -1 }).collect().length : 0
  }
}

/**
 * Cleanup storage
 */
export async function closeStorage() {
  console.log('🔒 Closing storage...')

  if (eventDB) {
    await eventDB.close()
    console.log('   ✅ EventDB closed')
  }

  if (orbitdb) {
    await orbitdb.disconnect()
    console.log('   ✅ OrbitDB disconnected')
  }

  if (ipfsInstance) {
    await ipfsInstance.stop()
    console.log('   ✅ IPFS stopped')
  }

  isInitialized = false
}

export default {
  initStorage,
  storeEvent,
  getAllEvents,
  getDeviceEvents,
  getDatabaseAddress,
  getStorageStatus,
  closeStorage
}
