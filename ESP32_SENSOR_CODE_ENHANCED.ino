#include <WiFi.h>
#include <WebServer.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ================= WiFi Configuration =================
const char* ssid = "sachin";
const char* password = "sachin123";

// ================= GPIO Pin Definitions =================
#define SOIL_PIN 34       // Analog pin for soil moisture sensor
#define RELAY_PIN 26      // Digital pin for relay motor control
#define DHTPIN 4          // Digital pin for DHT11 sensor
#define DHTTYPE DHT11     // DHT11 sensor type

// ================= Hardware Components =================
WebServer server(80);
DHT dht(DHTPIN, DHTTYPE);

// ================= Control Variables =================
int moistureThreshold = 2500;
bool motorState = false;
int pumpMode = 0;           // 0=AUTO, 1=FORCE_ON, 2=FORCE_OFF
bool autoMode = true;
unsigned long startTime = 0;

// ================= Calibration Constants =================
#define DRY_VAL 3200      // ADC value when soil is completely dry
#define WET_VAL 1200      // ADC value when soil is completely wet

// ================= Helper Functions =================

/**
 * Read soil moisture percentage (0-100%)
 * Maps ADC reading from dry to wet
 */
int readSoilMoisturePct() {
  int rawValue = 0;
  
  // Take 10 samples for averaging
  for (int i = 0; i < 10; i++) {
    rawValue += analogRead(SOIL_PIN);
    delay(5);
  }
  rawValue /= 10;
  
  // Map to percentage (0-100%)
  int pct = map(rawValue, DRY_VAL, WET_VAL, 0, 100);
  
  // Clamp between 0-100%
  pct = constrain(pct, 0, 100);
  
  return pct;
}

/**
 * Get WiFi signal strength in dBm
 */
int getWiFiSignal() {
  return WiFi.RSSI();
}

/**
 * Get system uptime in seconds
 */
unsigned long getUptime() {
  return (millis() - startTime) / 1000;
}

// ================= HTTP Handlers =================

/**
 * GET /
 * Root page - System status overview
 */
void handleRoot() {
  int moistureValue = analogRead(SOIL_PIN);
  int moisturePct = readSoilMoisturePct();
  
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  if (isnan(temperature)) temperature = 0;
  if (isnan(humidity)) humidity = 0;
  
  String soilStatus = (moisturePct > 70) ? "WET" : (moisturePct > 40) ? "MODERATE" : "DRY";
  String modeStr = (pumpMode == 0) ? "AUTO" : (pumpMode == 1) ? "FORCE ON" : "FORCE OFF";
  String motorStr = motorState ? "ON" : "OFF";
  
  String html = "<!DOCTYPE html>";
  html += "<html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1'>";
  html += "<title>Smart Irrigation System</title>";
  html += "<style>";
  html += "body{font-family:monospace;background:#0a0a0a;color:#0f0;padding:20px;margin:0;}";
  html += ".container{background:#111;border:1px solid #0f0;border-radius:10px;padding:20px;margin:10px 0;}";
  html += ".header{border-bottom:2px solid #0f0;padding-bottom:10px;margin-bottom:15px;}";
  html += ".status{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin:15px 0;}";
  html += ".stat-box{background:#1a1a1a;border:1px solid #0f0;padding:10px;border-radius:5px;}";
  html += ".label{font-size:0.9em;color:#0a0;}";
  html += ".value{font-size:1.3em;font-weight:bold;color:#0f0;margin-top:5px;}";
  html += ".warning{color:#ff0;}";
  html += ".error{color:#f00;}";
  html += "</style></head>";
  
  html += "<body>";
  html += "<div class='container'>";
  html += "<div class='header'>";
  html += "<h2>🌱 Smart Irrigation System</h2>";
  html += "<p>ESP32 IoT Hardware Status</p>";
  html += "</div>";
  
  html += "<div class='status'>";
  
  // Soil Status
  html += "<div class='stat-box'>";
  html += "<div class='label'>SOIL MOISTURE</div>";
  html += "<div class='value'>" + String(moisturePct) + "%</div>";
  html += "<div class='label' style='margin-top:5px;'>" + soilStatus + "</div>";
  html += "</div>";
  
  // Temperature
  html += "<div class='stat-box'>";
  html += "<div class='label'>TEMPERATURE</div>";
  html += "<div class='value'>" + String(temperature, 1) + "°C</div>";
  html += "</div>";
  
  // Humidity
  html += "<div class='stat-box'>";
  html += "<div class='label'>HUMIDITY</div>";
  html += "<div class='value'>" + String(humidity, 1) + "%</div>";
  html += "</div>";
  
  // Motor Status
  html += "<div class='stat-box'>";
  html += "<div class='label'>MOTOR</div>";
  html += "<div class='value" + (motorState ? "" : " error") + "'>" + motorStr + "</div>";
  html += "</div>";
  
  // Control Mode
  html += "<div class='stat-box'>";
  html += "<div class='label'>MODE</div>";
  html += "<div class='value'>" + modeStr + "</div>";
  html += "</div>";
  
  // WiFi Signal
  html += "<div class='stat-box'>";
  html += "<div class='label'>WiFi RSSI</div>";
  html += "<div class='value'>" + String(getWiFiSignal()) + " dBm</div>";
  html += "</div>";
  
  // GPIO State
  html += "<div class='stat-box'>";
  html += "<div class='label'>GPIO " + String(RELAY_PIN) + " STATE</div>";
  html += "<div class='value'>" + String(digitalRead(RELAY_PIN) ? "HIGH (ON)" : "LOW (OFF)") + "</div>";
  html += "</div>";
  
  // System Uptime
  html += "<div class='stat-box'>";
  html += "<div class='label'>UPTIME</div>";
  html += "<div class='value\">" + String(getUptime()) + "s</div>";
  html += "</div>";
  
  html += "</div></div></body></html>";
  
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  server.send(200, "text/html", html);
}

/**
 * GET /sensor
 * JSON endpoint for sensor data
 * Returns all sensor readings in JSON format
 */
void handleSensor() {
  int rawValue = analogRead(SOIL_PIN);
  int moisturePct = readSoilMoisturePct();
  
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  if (isnan(temperature)) temperature = 0;
  if (isnan(humidity)) humidity = 0;
  
  // Create JSON response
  StaticJsonDocument<256> json;
  json["moisture_pct"] = moisturePct;
  json["moisture_raw"] = rawValue;
  json["temperature"] = temperature;
  json["humidity"] = humidity;
  json["pump_mode"] = pumpMode == 0 ? "normal" : (pumpMode == 1 ? "forceon" : "forceoff");
  json["pump_state"] = motorState ? "ON" : "OFF";
  json["rssi"] = getWiFiSignal();
  json["uptime_s"] = getUptime();
  json["ip"] = WiFi.localIP().toString();
  
  String jsonStr;
  serializeJson(json, jsonStr);
  
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Content-Type", "application/json");
  server.sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  server.send(200, "application/json", jsonStr);
  
  Serial.println("[SENSOR] JSON sent: " + jsonStr);
}

/**
 * GET /normal
 * Set pump to AUTO mode
 * Motor turns ON/OFF based on soil moisture threshold
 */
void handleNormal() {
  pumpMode = 0;
  autoMode = true;
  
  int moisturePct = readSoilMoisturePct();
  
  // Auto control: ON if dry (<40%), OFF if wet (>40%)
  if (moisturePct < 40) {
    motorState = true;
    digitalWrite(RELAY_PIN, LOW);    // Relay ON
  } else {
    motorState = false;
    digitalWrite(RELAY_PIN, HIGH);   // Relay OFF
  }
  
  delay(50);  // GPIO stabilization
  
  String html = "<!DOCTYPE html><html><body style='font-family:monospace;background:#0a0a0a;color:#0f0'>";
  html += "<h2>Smart Irrigation System</h2>";
  html += "<p>Mode: <b>AUTO</b></p>";
  html += "<p>Soil Moisture: " + String(moisturePct) + "%</p>";
  html += "<p>Motor: " + String(motorState ? "ON" : "OFF") + "</p>";
  html += "<p>GPIO " + String(RELAY_PIN) + " State: " + String(digitalRead(RELAY_PIN) ? "HIGH" : "LOW (Motor OFF)") + "</p>";
  html += "</body></html>";
  
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  server.send(200, "text/html", html);
  
  Serial.println("[AXIS] Motor: AUTO MODE - Moisture: " + String(moisturePct) + "%");
}

/**
 * GET /forceon
 * Force motor ON immediately
 * Activates relay regardless of soil moisture
 */
void handleForceOn() {
  pumpMode = 1;
  autoMode = false;
  motorState = true;
  
  digitalWrite(RELAY_PIN, LOW);      // Relay ON (motor active)
  delay(50);                          // GPIO stabilization delay
  
  int moisturePct = readSoilMoisturePct();
  
  String html = "<!DOCTYPE html><html><body style='font-family:monospace;background:#0a0a0a;color:#0f0'>";
  html += "<h2>Smart Irrigation System</h2>";
  html += "<p>Mode: <b style='color:#0f0;'>FORCE ON</b></p>";
  html += "<p>Motor: <b style='color:#0f0;'>ON</b></p>";
  html += "<p>GPIO " + String(RELAY_PIN) + " State: " + String(digitalRead(RELAY_PIN) ? "HIGH (on)" : "LOW (Motor ACTIVE)") + "</p>";
  html += "<p>Soil: " + String(moisturePct) + "%</p>";
  html += "</body></html>";
  
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  server.send(200, "text/html", html);
  
  Serial.println("[AXIS] Motor: FORCE ON - GPIO set to LOW (Relay activated)");
  Serial.println("[AXIS] Pump should be running now");
}

/**
 * GET /forceoff
 * Force motor OFF immediately
 * Deactivates relay regardless of soil moisture
 */
void handleForceOff() {
  pumpMode = 2;
  autoMode = false;
  motorState = false;
  
  digitalWrite(RELAY_PIN, HIGH);     // Relay OFF (motor inactive)
  delay(50);                          // GPIO stabilization delay
  
  int moisturePct = readSoilMoisturePct();
  
  String html = "<html><body style='background:#0a0a0a;color:#f00;font-family:monospace;'>";
  html += "<h2>FORCEOFF</h2>";
  html += "<p>Motor: OFF</p>";
  html += "<p>GPIO " + String(RELAY_PIN) + ": " + String(digitalRead(RELAY_PIN)) + "</p>";
  html += "<p>Soil: " + String(moisturePct) + "%</p>";
  html += "</body></html>";
  
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  server.sendHeader("Content-Type", "text/html");
  server.send(200, "text/html", html);
  
  Serial.println("[AXIS] Motor: FORCE OFF - GPIO set to HIGH");
  Serial.println("[AXIS] Pump stopped");
}

/**
 * GET /on
 * Redirect handler for backward compatibility
 */
void handleOn() {
  server.sendHeader("Location", "/forceon");
  server.send(303);
}

/**
 * GET /off
 * Redirect handler for backward compatibility
 */
void handleOff() {
  server.sendHeader("Location", "/forceoff");
  server.send(303);
}

/**
 * GET /auto
 * Redirect handler for backward compatibility
 */
void handleAuto() {
  server.sendHeader("Location", "/normal");
  server.send(303);
}

/**
 * Handle CORS preflight requests
 */
void handleCORS() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(204);
}

// ================= SETUP =================

void setup() {
  // Initialize serial for debugging
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n");
  Serial.println("╔════════════════════════════════════════╗");
  Serial.println("║  Smart Irrigation System - ESP32       ║");
  Serial.println("║  Hardware Monitor & Motor Control      ║");
  Serial.println("╚════════════════════════════════════════╝");
  
  // Initialize GPIO pins
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);      // Motor OFF on startup
  
  Serial.println("[SETUP] Relay pin " + String(RELAY_PIN) + " configured (initially OFF)");
  
  // Initialize DHT sensor
  dht.begin();
  Serial.println("[SETUP] DHT11 sensor initialized on GPIO " + String(DHTPIN));
  
  // Connect to WiFi
  Serial.print("[SETUP] Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  Serial.println();
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("[SETUP] ✓ WiFi connected!");
    Serial.print("[SETUP] IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("[SETUP] Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("[SETUP] ✗ WiFi connection failed!");
    Serial.println("[SETUP] Retrying in 5 seconds...");
    delay(5000);
    ESP.restart();
  }
  
  // Register HTTP request handlers
  server.on("/", HTTP_GET, handleRoot);
  server.on("/sensor", HTTP_GET, handleSensor);
  server.on("/normal", HTTP_GET, handleNormal);
  server.on("/forceon", HTTP_GET, handleForceOn);
  server.on("/forceoff", HTTP_GET, handleForceOff);
  server.on("/on", HTTP_GET, handleOn);
  server.on("/off", HTTP_GET, handleOff);
  server.on("/auto", HTTP_GET, handleAuto);
  
  // Debug endpoint
  server.on("/debug", HTTP_GET, []() {
    String debug = "ESP32 Status\n";
    debug += "IP: " + WiFi.localIP().toString() + "\n";
    debug += "Handlers: /sensor, /forceon, /forceoff, /normal\n";
    debug += "GPIO " + String(RELAY_PIN) + ": " + String(digitalRead(RELAY_PIN)) + "\n";
    debug += "Motor: " + String(motorState ? "ON" : "OFF") + "\n";
    server.send(200, "text/plain", debug);
  });
  
  server.onNotFound([]() {
    String msg = "404 Not Found. Available: /sensor, /forceon, /forceoff, /normal, /debug";
    server.send(404, "text/plain", msg);
  });
  
  // Handle CORS
  server.on("/", HTTP_OPTIONS, handleCORS);
  
  // Start web server
  server.begin();
  Serial.println("[SETUP] Web server started on port 80");
  
  // Record startup time for uptime calculation
  startTime = millis();
  
  Serial.println("[SETUP] ✓ System initialized and ready!");
  Serial.println("\nAvailable endpoints:");
  Serial.println("  GET  /             - Status page");
  Serial.println("  GET  /sensor       - JSON sensor data");
  Serial.println("  GET  /forceon      - Motor ON");
  Serial.println("  GET  /forceoff     - Motor OFF");
  Serial.println("  GET  /normal       - AUTO mode");
}

// ================= MAIN LOOP =================

void loop() {
  // Handle incoming HTTP requests
  server.handleClient();
  
  // AUTO mode control: Poll soil moisture and control motor
  if (autoMode && pumpMode == 0) {
    int moisturePct = readSoilMoisturePct();
    
    // Turn ON if soil is dry (<40%)
    if (moisturePct < 40 && !motorState) {
      motorState = true;
      digitalWrite(RELAY_PIN, LOW);
      Serial.println("[AUTO] Soil dry (" + String(moisturePct) + "%) - Motor ON");
    }
    // Turn OFF if soil is wet (>75%)
    else if (moisturePct > 75 && motorState) {
      motorState = false;
      digitalWrite(RELAY_PIN, HIGH);
      Serial.println("[AUTO] Soil wet (" + String(moisturePct) + "%) - Motor OFF");
    }
  }
  
  delay(500);  // Small delay to prevent watchdog timeout
}

/* 
  ═══════════════════════════════════════════════════════════════════════════
  
  TESTING & DEBUGGING ENDPOINTS
  
  Test these endpoints from browser or curl:
  
  1. Status Page:
     http://10.57.97.215/
  
  2. Sensor JSON Data:
     http://10.57.97.215/sensor
  
  3. Motor Control:
     http://10.57.97.215/forceon   (Turn motor ON)
     http://10.57.97.215/forceoff  (Turn motor OFF)
     http://10.57.97.215/normal    (AUTO mode)
  
  4. Check Serial Monitor for detailed logs:
     Arduino IDE Serial Monitor at 115200 baud
  
  ═══════════════════════════════════════════════════════════════════════════
*/
