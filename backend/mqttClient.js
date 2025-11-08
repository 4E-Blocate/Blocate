import mqtt from 'mqtt'
import { config } from './config.js'

let client = null
let isConnected = false
let messageHandler = null

/**
 * Initialize MQTT client connection
 * @param {Function} onMessage - Callback for incoming messages
 */
export async function initMQTT(onMessage) {
  return new Promise((resolve, reject) => {
    console.log('Connecting to MQTT broker...')
    console.log(`   Broker: ${config.MQTT_BROKER}`)

    const options = {
      clientId: config.NODE_ID,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000
    }

    if (config.MQTT_USERNAME) {
      options.username = config.MQTT_USERNAME
      options.password = config.MQTT_PASSWORD
    }

    client = mqtt.connect(config.MQTT_BROKER, options)

    messageHandler = onMessage

    client.on('connect', () => {
      isConnected = true
      console.log('MQTT connected')
      console.log(`   Client ID: ${config.NODE_ID}`)

      // Subscribe to all patient telemetry topics
      client.subscribe('patient/+/telemetry', (err) => {
        if (err) {
          console.error('Failed to subscribe to telemetry topics:', err)
          reject(err)
        } else {
          console.log('Subscribed to: patient/+/telemetry')
          resolve(true)
        }
      })

      // Subscribe to alert topics
      client.subscribe('patient/+/alert', (err) => {
        if (err) {
          console.error('Failed to subscribe to alert topics:', err)
        } else {
          console.log('Subscribed to: patient/+/alert')
        }
      })
    })

    client.on('message', (topic, message) => {
      try {
        const payload = JSON.parse(message.toString())
        console.log(`MQTT message received:`)
        console.log(`   Topic: ${topic}`)
        console.log(`   Device: ${payload.deviceId}`)

        if (messageHandler) {
          messageHandler(topic, payload)
        }
      } catch (error) {
        console.error('Invalid MQTT message format:', error.message)
      }
    })

    client.on('error', (error) => {
      console.error('MQTT error:', error.message)
      isConnected = false
      reject(error)
    })

    client.on('offline', () => {
      console.log('MQTT offline')
      isConnected = false
    })

    client.on('reconnect', () => {
      console.log('MQTT reconnecting...')
    })

    client.on('close', () => {
      console.log('MQTT connection closed')
      isConnected = false
    })
  })
}

/**
 * Publish message to MQTT topic
 * @param {string} topic - MQTT topic
 * @param {Object} payload - Message payload
 */
export function publishMQTT(topic, payload) {
  if (!isConnected || !client) {
    console.error('❌ Cannot publish: MQTT not connected')
    return false
  }

  try {
    const message = JSON.stringify(payload)
    client.publish(topic, message, { qos: 1 })
    console.log(`📤 Published to ${topic}`)
    return true
  } catch (error) {
    console.error('❌ Failed to publish MQTT message:', error.message)
    return false
  }
}

/**
 * Subscribe to additional topic
 * @param {string} topic - MQTT topic pattern
 */
export function subscribeMQTT(topic) {
  if (!isConnected || !client) {
    console.error('❌ Cannot subscribe: MQTT not connected')
    return false
  }

  client.subscribe(topic, (err) => {
    if (err) {
      console.error(`❌ Failed to subscribe to ${topic}:`, err)
      return false
    }
    console.log(`✅ Subscribed to: ${topic}`)
    return true
  })
}

/**
 * Get MQTT connection status
 */
export function getMQTTStatus() {
  return {
    connected: isConnected,
    broker: config.MQTT_BROKER,
    clientId: config.NODE_ID
  }
}

/**
 * Close MQTT connection
 */
export async function closeMQTT() {
  if (client) {
    await client.endAsync()
    isConnected = false
    console.log('🔒 MQTT connection closed')
  }
}

export default {
  initMQTT,
  publishMQTT,
  subscribeMQTT,
  getMQTTStatus,
  closeMQTT
}
