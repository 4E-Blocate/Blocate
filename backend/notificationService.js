import { WebSocketServer } from 'ws'
import fetch from 'node-fetch'
import { config } from './config.js'
import { getDeviceInfo } from './tonBlockchain.js'

// ============ State Management ============

let wss = null
const guardianConnections = new Map() // Map<guardianAddress, Set<WebSocket>>

// ============ WebSocket Real-Time Notifications ============

/**
 * Initialize WebSocket server for real-time browser notifications
 * @param {Object} httpServer - HTTP server instance to attach to
 */
export function initWebSocketNotifications(httpServer) {
  if (!config.WEBSOCKET_ENABLED) {
    console.log('WebSocket notifications disabled')
    return
  }

  wss = new WebSocketServer({ 
    server: httpServer,
    path: '/notifications'
  })

  wss.on('connection', (ws, request) => {
    console.log('📱 New WebSocket connection')

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString())
        
        // Client sends guardian address + optional contact info to subscribe
        if (data.type === 'subscribe' && data.guardianAddress) {
          const address = data.guardianAddress.toLowerCase()
          
          if (!guardianConnections.has(address)) {
            guardianConnections.set(address, new Set())
          }
          guardianConnections.get(address).add(ws)
          
          ws.guardianAddress = address
          
          // Auto-register contact info if provided
          if (data.telegramChatId || data.email) {
            const contacts = {}
            if (data.telegramChatId) contacts.telegramChatId = data.telegramChatId
            if (data.email) contacts.email = data.email
            registerGuardianContacts(address, contacts)
          }
          
          ws.send(JSON.stringify({
            type: 'subscribed',
            guardianAddress: address,
            message: 'Successfully subscribed to notifications'
          }))
          
          console.log(`✅ Guardian ${address} subscribed for notifications`)
        }
      } catch (error) {
        console.error('WebSocket message error:', error.message)
      }
    })

    ws.on('close', () => {
      if (ws.guardianAddress) {
        const connections = guardianConnections.get(ws.guardianAddress)
        if (connections) {
          connections.delete(ws)
          if (connections.size === 0) {
            guardianConnections.delete(ws.guardianAddress)
          }
        }
        console.log(`Guardian ${ws.guardianAddress} disconnected`)
      }
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error.message)
    })
  })

  console.log(`✅ WebSocket notification server started on ${config.WEBSOCKET_PORT}`)
}

/**
 * Send real-time notification to guardian via WebSocket
 * @param {string} guardianAddress - Guardian wallet address
 * @param {Object} alert - Alert data
 */
export async function sendWebSocketNotification(guardianAddress, alert) {
  if (!wss || !guardianAddress) return

  const address = guardianAddress.toLowerCase()
  const connections = guardianConnections.get(address)

  if (!connections || connections.size === 0) {
    console.log(`ℹ️  No active WebSocket connections for guardian ${address}`)
    return
  }

  const notification = {
    type: 'alert',
    timestamp: Date.now(),
    ...alert
  }

  const message = JSON.stringify(notification)
  let sentCount = 0

  connections.forEach((ws) => {
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.send(message)
      sentCount++
    }
  })

  if (sentCount > 0) {
    console.log(`📱 WebSocket alert sent to ${sentCount} connection(s) for guardian ${address}`)
  }
}

// ============ WebSocket Real-Time Notifications ============

/**
 * Send Telegram notification to guardian
 * @param {string} telegramChatId - Guardian's Telegram chat ID
 * @param {Object} alert - Alert data
 */
export async function sendTelegramNotification(telegramChatId, alert) {
  if (!config.TELEGRAM_ENABLED || !config.TELEGRAM_BOT_TOKEN || !telegramChatId) {
    return
  }

  const { deviceId, patientName, alertType, message, bpm, temp, spo2, gps, guardianAddress } = alert

  let emoji = '⚠️'
  if (alertType === 'critical') emoji = '🚨'
  if (alertType === 'geofence') emoji = '📍'

  // Build vital signs section
  let vitalsText = `📊 *Vital Signs:*
❤️ Heart Rate: *${bpm} BPM* ${bpm > 120 || bpm < 50 ? '⚠️ ABNORMAL' : '✓'}
🌡️ Temperature: *${temp}°C* ${temp > 38 || temp < 35.5 ? '⚠️ ABNORMAL' : '✓'}`

  // Add SpO2 if available
  if (spo2 !== undefined) {
    vitalsText += `\n🫁 Blood O₂: *${spo2}%* ${spo2 < 95 ? '⚠️ LOW' : '✓'}`
  }

  // Add guardian info if this is an admin notification
  const guardianInfo = guardianAddress ? `\n👨‍⚕️ *Guardian:* \`${guardianAddress}\`` : ''

  const text = `
${emoji} *PATIENT ALERT: ${alertType.toUpperCase()}*

👤 *Patient:* ${patientName || 'Unknown'}
🔖 *Device:* \`${deviceId}\`${guardianInfo}
🕐 *Time:* ${new Date().toLocaleString()}

${vitalsText}

💡 *Reason:* ${message}
${gps ? `\n📍 [View Location on Map](https://www.google.com/maps?q=${gps})` : ''}
  `.trim()

  const url = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: text,
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      })
    })

    const result = await response.json()

    if (result.ok) {
      console.log(`📱 Telegram alert sent to chat ${telegramChatId}`)
      return result
    } else {
      console.error(`Telegram API error:`, result.description)
      throw new Error(result.description)
    }
  } catch (error) {
    console.error(`Failed to send Telegram notification:`, error.message)
    throw error
  }
}

// ============ Guardian Contact Information Storage ============

// In-memory storage for guardian contact info
// In production, this should be in a database or blockchain
const guardianContacts = new Map()

/**
 * Register guardian contact information
 * @param {string} guardianAddress - Guardian wallet address
 * @param {Object} contacts - Contact information {email, telegramChatId}
 */
export function registerGuardianContacts(guardianAddress, contacts) {
  guardianContacts.set(guardianAddress.toLowerCase(), contacts)
  console.log(`✅ Guardian contacts registered for ${guardianAddress}`)
}

/**
 * Get guardian contact information
 * @param {string} guardianAddress - Guardian wallet address
 * @returns {Object} Contact information
 */
export function getGuardianContacts(guardianAddress) {
  return guardianContacts.get(guardianAddress.toLowerCase()) || {}
}

// ============ Unified Notification Dispatcher ============

/**
 * Send alert to guardian through all configured channels
 * @param {string} deviceId - Device that triggered the alert
 * @param {Object} alertData - Alert information
 */
export async function notifyGuardian(deviceId, alertData) {
  try {
    // Get device info from blockchain to find guardian
    const deviceInfo = await getDeviceInfo(deviceId)
    if (!deviceInfo || !deviceInfo.guardian) {
      console.warn(`Cannot notify: No guardian found for device ${deviceId}`)
      return
    }

    const guardianAddress = deviceInfo.guardian
    const contacts = getGuardianContacts(guardianAddress)

    // Prepare alert message
    const alert = {
      deviceId,
      patientName: deviceInfo.fullName || 'Unknown',
      guardianAddress,
      alertType: alertData.eventType || 'alert',
      message: alertData.message || determineAlertMessage(alertData),
      bpm: alertData.bpm,
      temp: alertData.temp,
      gps: alertData.gps,
      timestamp: alertData.timestamp || Date.now(),
      aiInterpretation: alertData.aiInterpretation
    }
    
    // Include SpO2 if available
    if (alertData.spo2 !== undefined) {
      alert.spo2 = alertData.spo2
    }

    console.log(`\n🔔 NOTIFYING GUARDIAN: ${guardianAddress}`)
    console.log(`   Patient: ${alert.patientName}`)
    console.log(`   Alert Type: ${alert.alertType}`)
    console.log(`   Reason: ${alert.message}`)

    const notifications = []

    // 1. WebSocket (real-time browser notification)
    if (config.WEBSOCKET_ENABLED) {
      notifications.push(
        sendWebSocketNotification(guardianAddress, alert).catch(err => 
          console.error('WebSocket notification failed:', err.message)
        )
      )
    }

    // 2. Telegram - Send to guardian if they have registered their chat ID
    if (config.TELEGRAM_ENABLED && contacts.telegramChatId) {
      notifications.push(
        sendTelegramNotification(contacts.telegramChatId, alert).catch(err =>
          console.error('Telegram notification failed:', err.message)
        )
      )
    }

    // 3. Telegram - ALWAYS send to admin chat ID if configured (for all alerts)
    if (config.TELEGRAM_ENABLED && config.TELEGRAM_CHAT_ID) {
      notifications.push(
        sendTelegramNotification(config.TELEGRAM_CHAT_ID, {
          ...alert,
          guardianAddress: guardianAddress // Include guardian info for admin
        }).catch(err =>
          console.error('Telegram admin notification failed:', err.message)
        )
      )
    }

    // Send all notifications in parallel
    await Promise.allSettled(notifications)

    console.log(`✅ Guardian notification process completed\n`)

  } catch (error) {
    console.error('Failed to notify guardian:', error.message)
  }
}

/**
 * Determine human-readable alert message
 * @param {Object} data - Alert data
 * @returns {string} Alert message
 */
function determineAlertMessage(data) {
  const messages = []

  if (data.bpm > 120) messages.push(`High heart rate (${data.bpm} BPM)`)
  if (data.bpm < 50) messages.push(`Low heart rate (${data.bpm} BPM)`)
  if (data.temp > 38) messages.push(`High temperature (${data.temp}°C)`)
  if (data.temp < 35.5) messages.push(`Low temperature (${data.temp}°C)`)
  if (data.spo2 !== undefined && data.spo2 < 90) messages.push(`Critical blood oxygen (${data.spo2}%)`)
  if (data.spo2 !== undefined && data.spo2 >= 90 && data.spo2 < 95) messages.push(`Low blood oxygen (${data.spo2}%)`)
  if (data.geofenceViolation) messages.push('Patient left safe zone')
  if (data.isManualAlert) messages.push('Emergency button pressed')

  return messages.join(', ') || 'Abnormal vital signs detected'
}

// ============ Cleanup ============

/**
 * Close all notification services
 */
export async function closeNotifications() {
  if (wss) {
    wss.close()
    console.log('WebSocket server closed')
  }

  guardianConnections.clear()
}

export default {
  initWebSocketNotifications,
  sendWebSocketNotification,
  sendTelegramNotification,
  registerGuardianContacts,
  getGuardianContacts,
  notifyGuardian,
  closeNotifications
}
