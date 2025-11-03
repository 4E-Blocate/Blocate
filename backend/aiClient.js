import fetch from 'node-fetch'
import { config } from './config.js'

/**
 * Interpret patient health data using Gemini AI
 * @param {Object} sensorData - Sensor readings {bpm, temp, gps}
 * @returns {Promise<string>} AI interpretation
 */
export async function interpretHealthData(sensorData) {
  if (!config.AI_ENABLED || !config.GEMINI_API_KEY) {
    return config.AI_FALLBACK_MESSAGE
  }

  try {
    const { bpm, temp, gps } = sensorData

    const prompt = `You are a medical monitoring assistant.
Given the following patient vital signs:
- Heart Rate (BPM): ${bpm}
- Body Temperature: ${temp}°C
- GPS Location: ${gps}

Provide a brief, one-sentence interpretation of the patient's condition.
Return only one phrase (e.g., "Stable", "Possible heat stress", "Elevated heart rate - monitor closely").
Keep it under 10 words.`

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    }

    const response = await fetch(
      `${config.GEMINI_API_URL}?key=${config.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        timeout: 5000
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const interpretation = data.candidates[0].content.parts[0].text.trim()
      console.log(`🤖 AI Interpretation: "${interpretation}"`)
      return interpretation
    }

    return config.AI_FALLBACK_MESSAGE

  } catch (error) {
    console.error('⚠️  AI interpretation failed:', error.message)
    return config.AI_FALLBACK_MESSAGE
  }
}

/**
 * Get AI system status
 */
export function getAIStatus() {
  return {
    enabled: config.AI_ENABLED,
    provider: 'Gemini',
    configured: !!config.GEMINI_API_KEY
  }
}

export default {
  interpretHealthData,
  getAIStatus
}
