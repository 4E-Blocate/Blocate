import { determineEventType } from './utils/crypto.js'
import { interpretHealthData } from './aiClient.js'
import { storeEvent } from './gunClient.js'
import { logEventToChain, isDeviceRegistered, getDeviceInfo } from './tonBlockchain.js'
import { calculateDistance } from './utils/geo.js'

/**
 * Process incoming telemetry data from IoT device
 * @param {Object} payload - MQTT payload
 * @returns {Promise<Object>} Processing result
 */
export async function processTelemetry(payload) {
  try {
    const { deviceId, bpm, temp, gps, timestamp } = payload

    // Validate data
    if (!deviceId || bpm === undefined || temp === undefined) {
      throw new Error('Invalid telemetry data: missing required fields')
    }

    console.log(`\nProcessing telemetry for ${deviceId}`)
    console.log(`   BPM: ${bpm}, Temp: ${temp}°C, GPS: ${gps}`)

    // Check if device is registered on blockchain
    const registered = await isDeviceRegistered(deviceId)
    if (!registered) {
      console.warn(`Device ${deviceId} not registered on-chain - skipping blockchain logging`)
    }

    // Determine event type based on vitals
    let eventType = determineEventType(bpm, temp, gps)
    
    // --- Geofencing Logic ---
    if (registered) {
        try {
            // 1. Get "Home" location from blockchain
            const deviceInfo = await getDeviceInfo(deviceId);
            
            if (deviceInfo.homeLocation && gps) {
                // 2. Calculate distance
                const distKm = calculateDistance(gps, deviceInfo.homeLocation);
                console.log(`   Distance from home: ${distKm.toFixed(3)} km`);

                // 3. Threshold check (e.g., 0.5km / 500 meters)
                if (distKm > 0.5) {
                    console.warn(`   ⚠️ PATIENT OUTSIDE GEOFENCE!`);
                    // Override event type to alert guardian
                    if (eventType === 'normal') eventType = 'alert';
                }
            }
        } catch (err) {
            console.warn('   Failed to check geofence:', err.message);
        }
    }
    // -----------------------------

    console.log(`   Event type: ${eventType}`)

    // Get AI interpretation (optional)
    let aiInterpretation = null
    try {
      aiInterpretation = await interpretHealthData({ bpm, temp, gps })
    } catch (error) {
      console.warn('   AI interpretation failed, continuing without it')
    }

    // Prepare event data
    const eventData = {
      deviceId,
      bpm,
      temp,
      gps,
      timestamp: timestamp || Date.now(),
      eventType,
      aiInterpretation,
      processedBy: 'depin-node',
      processedAt: Date.now()
    }

    // Store full data in GunDB
    console.log(`Storing event in GunDB...`)
    const storageId = await storeEvent(eventData)

    // Log hash to blockchain (if device is registered)
    let blockchainResult = null
    if (registered) {
      try {
        console.log(`Logging to blockchain...`)
        blockchainResult = await logEventToChain(deviceId, eventData, eventType)
      } catch (error) {
        console.error(`Blockchain logging failed: ${error.message}`)
        // Continue anyway - data is still in OrbitDB
      }
    }

    const result = {
      success: true,
      deviceId,
      eventType,
      aiInterpretation,
      storage: {
        dbId: storageId,
        blockchain: blockchainResult
      },
      timestamp: eventData.timestamp
    }

    console.log(`Telemetry processed successfully\n`)
    return result

  } catch (error) {
    console.error(`Failed to process telemetry: ${error.message}\n`)
    throw error
  }
}

/**
 * Process alert message from IoT device
 * @param {Object} payload - Alert payload
 * @returns {Promise<Object>} Processing result
 */
export async function processAlert(payload) {
  try {
    console.log(`\nALERT received from ${payload.deviceId}`)
    
    // Treat alerts as critical events
    const eventData = {
      ...payload,
      eventType: 'critical',
      isManualAlert: true,
      processedAt: Date.now()
    }

    // Store in OrbitDB
    const orbitHash = await storeEvent(eventData)

    // Log to blockchain
    let blockchainResult = null
    const registered = await isDeviceRegistered(payload.deviceId)
    
    if (registered) {
      try {
        blockchainResult = await logEventToChain(
          payload.deviceId,
          eventData,
          'critical'
        )
      } catch (error) {
        console.error(`Failed to log alert to blockchain: ${error.message}`)
      }
    }

    console.log(`Alert processed\n`)
    
    return {
      success: true,
      deviceId: payload.deviceId,
      eventType: 'critical',
      storage: {
        orbitdb: orbitHash,
        blockchain: blockchainResult
      }
    }

  } catch (error) {
    console.error(`Failed to process alert: ${error.message}\n`)
    throw error
  }
}

/**
 * Validate telemetry data structure
 * @param {Object} data - Telemetry data
 * @returns {boolean} True if valid
 */
export function validateTelemetryData(data) {
  const required = ['deviceId', 'bpm', 'temp']
  
  for (const field of required) {
    if (!(field in data)) {
      return false
    }
  }

  // Validate ranges
  if (data.bpm < 0 || data.bpm > 250) return false
  if (data.temp < 30 || data.temp > 45) return false

  return true
}

export default {
  processTelemetry,
  processAlert,
  validateTelemetryData
}
