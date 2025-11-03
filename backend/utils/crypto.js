import { createHash } from 'crypto'

/**
 * Generate SHA-256 hash of event data for blockchain storage
 * @param {Object} eventData - The event data to hash
 * @returns {string} Hex string of the hash (with 0x prefix)
 */
export function hashEventData(eventData) {
  const dataString = JSON.stringify(eventData, Object.keys(eventData).sort())
  const hash = createHash('sha256').update(dataString).digest('hex')
  return `0x${hash}`
}

/**
 * Generate SHA-256 hash as bytes32 format for Solidity
 * @param {Object} eventData - The event data to hash
 * @returns {string} Bytes32 formatted hash
 */
export function hashToBytes32(eventData) {
  return hashEventData(eventData)
}

/**
 * Verify event data matches a given hash
 * @param {Object} eventData - The event data to verify
 * @param {string} hash - The hash to compare against
 * @returns {boolean} True if hash matches
 */
export function verifyEventHash(eventData, hash) {
  const computedHash = hashEventData(eventData)
  return computedHash === hash
}

/**
 * Generate deterministic event condition
 * @param {number} bpm - Heart rate
 * @param {number} temp - Temperature
 * @param {string} gps - GPS coordinates
 * @returns {string} Event type: "normal", "alert", or "critical"
 */
export function determineEventType(bpm, temp, gps) {
  // Critical conditions
  if (bpm > 140 || bpm < 40) return 'critical'
  if (temp > 39 || temp < 35) return 'critical'
  
  // Alert conditions
  if (bpm > 120 || bpm < 50) return 'alert'
  if (temp > 38 || temp < 35.5) return 'alert'
  
  // Normal
  return 'normal'
}

export default {
  hashEventData,
  hashToBytes32,
  verifyEventHash,
  determineEventType
}
