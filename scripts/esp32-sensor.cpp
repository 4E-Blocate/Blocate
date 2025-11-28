/**
 * ESP32/Arduino MQTT Patient Monitor
 * 
 * Hardware Requirements:
 * - ESP32 board
 * - MAX30102 (Heart rate & SpO2 sensor)
 * - MLX90614 or DS18B20 (Temperature sensor)
 * - GPS module (NEO-6M or similar)
 * 
 * Libraries Required:
 * - PubSubClient (MQTT)
 * - WiFi
 * - ArduinoJson
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "Mesh18";
const char* password = "18181818";

// MQTT Broker settings
const char* mqtt_server = "10.160.83.208";  // Your computer's IP running MQTT broker
const int mqtt_port = 1883;
const char* device_id = "patient-002";

// Topics
char telemetry_topic[50];
char alert_topic[50];

// WiFi and MQTT clients
WiFiClient espClient;
PubSubClient client(espClient);

// Sensor data (mock values for testing)
float currentBPM = 75.0;
float currentTemp = 36.5;
String currentGPS = "14.5995,120.9842";

// Timing
unsigned long lastPublish = 0;
const long publishInterval = 5000;  // Publish every 5 seconds

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n========================================");
  Serial.println("Patient Guardian - ESP32 IoT Node");
  Serial.println("========================================");
  
  // Setup MQTT topics
  sprintf(telemetry_topic, "patient/%s/telemetry", device_id);
  sprintf(alert_topic, "patient/%s/alert", device_id);
  
  // Connect to WiFi
  setupWiFi();
  
  // Setup MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);
  
  Serial.println("Setup complete!");
  Serial.println("========================================\n");
}

void loop() {
  // Maintain MQTT connection
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();
  
  // Publish telemetry data periodically
  unsigned long currentMillis = millis();
  if (currentMillis - lastPublish >= publishInterval) {
    lastPublish = currentMillis;
    
    // Read sensors (mock data for now)
    readSensors();
    
    // Publish telemetry
    publishTelemetry();
  }
}

void setupWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\n WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT broker...");
    
    if (client.connect(device_id)) {
      Serial.println("Connected!");
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message received on topic: ");
  Serial.println(topic);
}

void readSensors() {
  // TODO: Replace with actual sensor readings
  // For now, generate mock data with slight variations
  
  // Simulate heart rate variation (60-80 BPM normal range)
  currentBPM = 70.0 + random(-10, 10);
  
  // Simulate temperature variation (36.0-37.5°C normal range)
  currentTemp = 36.5 + (random(-5, 5) / 10.0);
  
  // Simulate slight GPS movement
  float lat = 14.5995 + (random(-50, 50) / 10000.0);
  float lng = 120.9842 + (random(-50, 50) / 10000.0);
  currentGPS = String(lat, 6) + "," + String(lng, 6);
  
  Serial.println("\n Sensor Readings:");
  Serial.printf("   BPM: %.1f\n", currentBPM);
  Serial.printf("   Temp: %.1f°C\n", currentTemp);
  Serial.printf("   GPS: %s\n", currentGPS.c_str());
}

void publishTelemetry() {
  // Create JSON document
  StaticJsonDocument<256> doc;
  
  doc["deviceId"] = device_id;
  doc["bpm"] = (int)currentBPM;
  doc["temp"] = currentTemp;
  doc["gps"] = currentGPS;
  doc["timestamp"] = millis();
  
  // Serialize JSON to string
  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);
  
  // Publish to MQTT
  Serial.println("\n Publishing telemetry...");
  Serial.printf("   Topic: %s\n", telemetry_topic);
  Serial.printf("   Payload: %s\n", jsonBuffer);
  
  if (client.publish(telemetry_topic, jsonBuffer)) {
    Serial.println("   Published successfully!");
  } else {
    Serial.println("   Publish failed!");
  }
}

void publishAlert() {
  // Create alert JSON
  StaticJsonDocument<256> doc;
  
  doc["deviceId"] = device_id;
  doc["type"] = "manual";
  doc["message"] = "Emergency button pressed!";
  doc["bpm"] = (int)currentBPM;
  doc["temp"] = currentTemp;
  doc["gps"] = currentGPS;
  doc["timestamp"] = millis();
  
  // Serialize and publish
  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);
  
  Serial.println("\n Publishing ALERT...");
  Serial.printf("   Topic: %s\n", alert_topic);
  
  if (client.publish(alert_topic, jsonBuffer)) {
    Serial.println("   Alert sent!");
  } else {
    Serial.println("   Alert failed!");
  }
}

// Example: Call this function when emergency button is pressed
// You can connect a button to a GPIO pin and call this in the interrupt
void onEmergencyButton() {
  Serial.println("\n EMERGENCY BUTTON PRESSED!");
  publishAlert();
}

/*
 * HARDWARE SETUP GUIDE
 * ====================
 * 
 * MAX30102 (Heart Rate Sensor):
 * - VIN  -> 3.3V
 * - GND  -> GND
 * - SDA  -> GPIO 21 (ESP32 I2C SDA)
 * - SCL  -> GPIO 22 (ESP32 I2C SCL)
 * 
 * MLX90614 (Temperature Sensor):
 * - VIN  -> 3.3V
 * - GND  -> GND
 * - SDA  -> GPIO 21 (shared I2C)
 * - SCL  -> GPIO 22 (shared I2C)
 * 
 * GPS Module (NEO-6M):
 * - VCC  -> 5V
 * - GND  -> GND
 * - TX   -> GPIO 16 (RX2)
 * - RX   -> GPIO 17 (TX2)
 * 
 * Emergency Button:
 * - One side -> GPIO 4
 * - Other side -> GND
 * - Add 10kΩ pull-up resistor
 */
