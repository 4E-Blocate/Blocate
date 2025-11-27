import Gun from 'gun'
import http from 'http'
import { config } from './config.js'

let gun = null
let eventDB = null
let isInitialized = false

/**
 * Initialize GunDB (Decentralized Graph Database)
 */
export async function initStorage() {
  try {
    console.log('Initializing decentralized storage (GunDB)...')

    // Initialize Gun
    // In a real DePIN setup, you would add peers here:
    // peers: ['http://peer1.com/gun', 'http://peer2.com/gun']
    
    // Create HTTP server for Gun relay
    const server = http.createServer()
    
    gun = Gun({
      file: 'data.json', // Local storage file
      radisk: true, // Use Radix storage engine
      web: server // HTTP server for Gun
    })

    // Start Gun relay server
    server.listen(8765, () => {
      console.log('AXE relay enabled!')
    })

    console.log(`GunDB initialized`)

    // Reference to the events node
    eventDB = gun.get('events')

    isInitialized = true
    return true

  } catch (error) {
    console.error('Storage initialization failed:', error.message)
    throw error
  }
}

/**
 * Store event in GunDB
 * @param {Object} eventData - Event data to store
 * @returns {Promise<string>} Entry ID (timestamp-based)
 */
export async function storeEvent(eventData) {
  if (!isInitialized || !eventDB) {
    throw new Error('Storage not initialized')
  }

  return new Promise((resolve, reject) => {
    try {
      const enrichedEvent = {
        ...eventData,
        node: config.NODE_ID,
        storedAt: Date.now()
      }

      // Use timestamp + random string as unique ID
      const eventId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Store in GunDB
      eventDB.get(eventId).put(enrichedEvent, (ack) => {
        if (ack.err) {
          console.error('❌ Failed to store event:', ack.err)
          reject(new Error(ack.err))
        } else {
          console.log(`💾 Event stored in GunDB: ${eventId}`)
          resolve(eventId)
        }
      })

    } catch (error) {
      console.error('❌ Failed to store event:', error.message)
      reject(error)
    }
  })
}

/**
 * Get storage status
 */
export function getStorageStatus() {
  return {
    initialized: isInitialized,
    engine: 'GunDB',
    peers: gun ? gun._.opt.peers : {}
  }
}

/**
 * Close storage connection
 */
export async function closeStorage() {
  // Gun doesn't really "close" in the same way, but we can nullify
  isInitialized = false
  console.log('Storage connection closed')
}

export default {
  initStorage,
  storeEvent,
  getStorageStatus,
  closeStorage
}
