/**
 * MQTT Test Script - Mock IoT Sensor Data Publisher
 * Simulates ESP32 sending patient vitals to the backend
 */

import mqtt from 'mqtt';

// Configuration
const MQTT_BROKER = 'mqtt://localhost:1883';
const DEVICE_ID = 'patient-001';

// Connect to MQTT broker
const client = mqtt.connect(MQTT_BROKER);

// Generate random vitals data
function generateMockVitals() {
  // Normal ranges:
  // BPM: 60-100 (normal), 100-120 (alert), >120 (critical)
  // Temp: 36.1-37.2°C (normal), 37.3-38°C (alert), >38°C (critical)
  
  const scenarios = [
    // Normal vitals
    {
      bpm: 70 + Math.random() * 20,      // 70-90
      temp: 36.2 + Math.random() * 0.8,  // 36.2-37.0
      scenario: 'normal'
    },
    // Alert vitals
    {
      bpm: 100 + Math.random() * 15,     // 100-115
      temp: 37.4 + Math.random() * 0.4,  // 37.4-37.8
      scenario: 'alert'
    },
    // Critical vitals
    {
      bpm: 125 + Math.random() * 15,     // 125-140
      temp: 38.2 + Math.random() * 0.5,  // 38.2-38.7
      scenario: 'critical'
    }
  ];

  // Randomly pick a scenario (80% normal, 15% alert, 5% critical)
  const rand = Math.random();
  let selectedScenario;
  if (rand < 0.80) {
    selectedScenario = scenarios[0]; // Normal
  } else if (rand < 0.95) {
    selectedScenario = scenarios[1]; // Alert
  } else {
    selectedScenario = scenarios[2]; // Critical
  }

  // Mock GPS coordinates (Manila, Philippines area)
  const baseLat = 14.5995;
  const baseLng = 120.9842;
  const gps = `${(baseLat + (Math.random() - 0.5) * 0.01).toFixed(6)},${(baseLng + (Math.random() - 0.5) * 0.01).toFixed(6)}`;

  return {
    deviceId: DEVICE_ID,
    bpm: Math.round(selectedScenario.bpm),
    temp: parseFloat(selectedScenario.temp.toFixed(1)),
    gps: gps,
    timestamp: Date.now(),
    scenario: selectedScenario.scenario
  };
}

// MQTT event handlers
client.on('connect', () => {
  console.log('✅ Connected to MQTT broker:', MQTT_BROKER);
  console.log('📡 Publishing mock sensor data...\n');
  
  // Send initial test message
  sendTelemetry();
  
  // Send telemetry every 5 seconds
  setInterval(sendTelemetry, 5000);
  
  // Send a manual alert after 15 seconds (for testing)
  setTimeout(sendAlert, 15000);
});

client.on('error', (error) => {
  console.error('❌ MQTT connection error:', error.message);
  process.exit(1);
});

client.on('close', () => {
  console.log('Connection closed');
});

// Send telemetry data
function sendTelemetry() {
  const data = generateMockVitals();
  const topic = `patient/${DEVICE_ID}/telemetry`;
  
  console.log(`📤 [${new Date().toLocaleTimeString()}] Sending telemetry:`);
  console.log(`   Topic: ${topic}`);
  console.log(`   BPM: ${data.bpm} | Temp: ${data.temp}°C | GPS: ${data.gps}`);
  console.log(`   Scenario: ${data.scenario.toUpperCase()}`);
  
  client.publish(topic, JSON.stringify(data), (err) => {
    if (err) {
      console.error('   ❌ Publish failed:', err.message);
    } else {
      console.log('   ✅ Published successfully\n');
    }
  });
}

// Send manual alert
function sendAlert() {
  const alertData = {
    deviceId: DEVICE_ID,
    type: 'manual',
    message: 'Patient pressed emergency button!',
    bpm: 145,
    temp: 38.9,
    gps: '14.5995,120.9842',
    timestamp: Date.now()
  };
  
  const topic = `patient/${DEVICE_ID}/alert`;
  
  console.log(`🚨 [${new Date().toLocaleTimeString()}] Sending ALERT:`);
  console.log(`   Topic: ${topic}`);
  console.log(`   Type: ${alertData.type}`);
  console.log(`   Message: ${alertData.message}`);
  
  client.publish(topic, JSON.stringify(alertData), (err) => {
    if (err) {
      console.error('   ❌ Alert publish failed:', err.message);
    } else {
      console.log('   ✅ Alert sent successfully\n');
    }
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Stopping mock sensor...');
  client.end();
  process.exit(0);
});

console.log('🏥 Mock IoT Sensor Started');
console.log('================================');
console.log(`Device ID: ${DEVICE_ID}`);
console.log(`MQTT Broker: ${MQTT_BROKER}`);
console.log('================================\n');
