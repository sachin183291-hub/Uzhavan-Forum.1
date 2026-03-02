
/*
  ══════════════════════════════════════════════════════════
  ADD THIS CODE TO YOUR EXISTING ESP32 ARDUINO SKETCH
  Smart Irrigation System — Sensor Data Endpoint
  Target IP: 10.57.97.215

  CAPACITIVE SOIL SENSOR v2.0 wiring:
    AOUT → GPIO 34 (or any ADC pin)
    VCC  → 3.3V
    GND  → GND

  ADD THESE TO YOUR EXISTING CODE:
  ══════════════════════════════════════════════════════════
*/

#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>    // Install: Sketch → Include Library → Manage Libraries → ArduinoJson

// ── Pin for capacitive soil sensor AOUT ──
#define SOIL_PIN 34         // ← Change if your sensor is on a different pin

// ── Calibration values (tune these for YOUR sensor!) ──
// Method: read ADC when sensor is in DRY air → that's DRY_VAL
//         read ADC when sensor is in water   → that's WET_VAL
const int DRY_VAL = 3200;   // ADC reading in completely dry air
const int WET_VAL = 1200;   // ADC reading fully submerged in water

// ── Pump pin ──
#define MOTOR_PIN 2         // ← Your relay/motor GPIO pin

// ── Mode flag ──
extern int pumpMode;        // 0 = auto, 1 = force ON, 2 = force OFF

// ══════════════════════════════════════════
// STEP 1: Add this function to your sketch
// ══════════════════════════════════════════

int readSoilMoisturePct() {
  // Take 10 samples and average (reduces noise)
  long sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(SOIL_PIN);
    delay(5);
  }
  int raw = sum / 10;

  // Map to 0–100% (clamp within range)
  int pct = map(raw, DRY_VAL, WET_VAL, 0, 100);
  pct = constrain(pct, 0, 100);
  return pct;
}

String getPumpModeStr() {
  if (pumpMode == 1) return "forceon";
  if (pumpMode == 2) return "forceoff";
  return "normal";
}

// ══════════════════════════════════════════
// ROOT PAGE HANDLER
// ══════════════════════════════════════════

void handleRoot() {
  int pct = readSoilMoisturePct();
  bool on = (pumpMode == 1) || (pumpMode == 0 && pct < 40);
  String mode = getPumpModeStr();
  
  String html = "<!DOCTYPE html><html><body style='font-family:monospace;background:#0a0a0a;color:#0f0;padding:20px'>";
  html += "<h1>AXIS Smart Irrigation System</h1>";
  html += "<hr>";
  html += "<h2>System Status</h2>";
  html += "<p><b>IP Address:</b> " + WiFi.localIP().toString() + "</p>";
  html += "<p><b>WiFi RSSI:</b> " + String(WiFi.RSSI()) + " dBm</p>";
  html += "<p><b>Uptime:</b> " + String(millis() / 1000) + " seconds</p>";
  html += "<hr>";
  html += "<h2>Soil Monitoring</h2>";
  html += "<p><b>Moisture:</b> <span style='color:#0f0;'>" + String(pct) + "%</span></p>";
  html += "<p><b>Raw ADC:</b> " + String(analogRead(SOIL_PIN)) + "</p>";
  html += "<hr>";
  html += "<h2>Motor Control</h2>";
  html += "<p><b>Current Mode:</b> <span style='color:" + String(on ? "#0f0" : "#f00") + ";'>" + mode + "</span></p>";
  html += "<p><b>Motor Status:</b> <span style='color:" + String(on ? "#0f0" : "#f00") + ";'>" + String(on ? "ON" : "OFF") + "</span></p>";
  html += "<p><b>GPIO Output:</b> " + String(digitalRead(MOTOR_PIN) ? "HIGH" : "LOW") + "</p>";
  html += "<hr>";
  html += "<h2>Mode Selection</h2>";
  html += "<button onclick=\"fetch('/normal')\"><a href='/normal' style='color:inherit;text-decoration:none'>NORMAL (Auto)</a></button><br><br>";
  html += "<button onclick=\"fetch('/forceon')\"><a href='/forceon' style='color:inherit;text-decoration:none'>FORCE ON</a></button><br><br>";
  html += "<button onclick=\"fetch('/forceoff')\"><a href='/forceoff' style='color:inherit;text-decoration:none'>FORCE OFF</a></button><br><br>";
  html += "</body></html>";
  
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  server.send(200, "text/html", html);
}

// ══════════════════════════════════════════
// RELAY CONTROL HANDLERS (CRITICAL!)
// ══════════════════════════════════════════

void handleNormal() {
  pumpMode = 0;  // Auto mode (sensor-driven)
  int pct = readSoilMoisturePct();
  bool on = (pumpMode == 0 && pct < 40);
  digitalWrite(MOTOR_PIN, on ? HIGH : LOW);
  delay(50);  // Ensure GPIO change takes effect
  
  String html = "<!DOCTYPE html><html><body style='font-family:monospace;background:#0a0a0a;color:#0f0'>";
  html += "<h2>Smart Irrigation System</h2>";
  html += "<p>Mode: <b>NORMAL (Auto)</b></p>";
  html += "<p>Soil Moisture: <b>" + String(pct) + "%</b></p>";
  html += "<p>Pump: <b>" + String(on ? "ON" : "OFF") + "</b></p>";
  html += "<p>Pump Mode: NORMAL</p>";
  html += "<p>Status: Normal mode activated - pump will turn on/off based on soil moisture</p>";
  html += "<p>GPIO State: " + String(digitalRead(MOTOR_PIN) ? "HIGH (Motor ON)" : "LOW (Motor OFF)") + "</p>";
  html += "<a href='/normal'>Normal</a> | <a href='/forceon'>Force ON</a> | <a href='/forceoff'>Force OFF</a>";
  html += "</body></html>";
  
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET");
  server.sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  server.sendHeader("Content-Type", "text/html; charset=utf-8");
  server.send(200, "text/html", html);
  Serial.println("[AXIS] Mode: NORMAL - Ready for auto control");
}

void handleForceOn() {
  pumpMode = 1;  // Force ON
  digitalWrite(MOTOR_PIN, HIGH);  // Turn relay ON immediately
  delay(50);  // Ensure GPIO change takes effect
  
  int pct = readSoilMoisturePct();
  String html = "<!DOCTYPE html><html><body style='font-family:monospace;background:#0a0a0a;color:#0f0'>";
  html += "<h2>Smart Irrigation System</h2>";
  html += "<p>Mode: <b style='color:#0f0;'>FORCE ON</b></p>";
  html += "<p>Soil Moisture: <b>" + String(pct) + "%</b></p>";
  html += "<p>Pump: <b style='color:#0f0;'>ON</b></p>";
  html += "<p>Pump Mode: FORCEON</p>";
  html += "<p>Status: Motor relay activated - PUMPING NOW</p>";
  html += "<p>GPIO State: " + String(digitalRead(MOTOR_PIN) ? "HIGH (Motor ON)" : "LOW (Motor OFF)") + "</p>";
  html += "<a href='/normal'>Normal</a> | <a href='/forceon'>Force ON</a> | <a href='/forceoff'>Force OFF</a>";
  html += "</body></html>";
  
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET");
  server.sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  server.sendHeader("Content-Type", "text/html; charset=utf-8");
  server.send(200, "text/html", html);
  Serial.println("[AXIS] Motor: FORCE ON - GPIO set to HIGH");
}

void handleForceOff() {
  pumpMode = 2;  // Force OFF
  digitalWrite(MOTOR_PIN, LOW);   // Turn relay OFF immediately
  delay(50);  // Ensure GPIO change takes effect
  
  int pct = readSoilMoisturePct();
  String html = "<!DOCTYPE html><html><body style='font-family:monospace;background:#0a0a0a;color:#0f0'>";
  html += "<h2>Smart Irrigation System</h2>";
  html += "<p>Mode: <b style='color:#f00;'>FORCE OFF</b></p>";
  html += "<p>Soil Moisture: <b>" + String(pct) + "%</b></p>";
  html += "<p>Pump: <b>OFF</b></p>";
  html += "<p>Pump Mode: FORCEOFF</p>";
  html += "<p>Status: Motor relay deactivated - PUMP STOPPED</p>";
  html += "<p>GPIO State: " + String(digitalRead(MOTOR_PIN) ? "HIGH (Motor ON)" : "LOW (Motor OFF)") + "</p>";
  html += "<a href='/normal'>Normal</a> | <a href='/forceon'>Force ON</a> | <a href='/forceoff'>Force OFF</a>";
  html += "</body></html>";
  
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET");
  server.sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  server.sendHeader("Content-Type", "text/html; charset=utf-8");
  server.send(200, "text/html", html);
  Serial.println("[AXIS] Motor: FORCE OFF - GPIO set to LOW");
}

// ══════════════════════════════════════════
// STEP 2: Add this handler function
// ══════════════════════════════════════════

void handleSensor() {
  int rawADC     = analogRead(SOIL_PIN);
  int moisturePct = readSoilMoisturePct();
  bool pumpOn    = (pumpMode == 1) || (pumpMode == 0 && moisturePct < 40);

  // Build JSON response
  StaticJsonDocument<256> doc;
  doc["moisture_pct"]   = moisturePct;       // 0–100% moisture
  doc["moisture_raw"]   = rawADC;            // Raw ADC value (0–4095)
  doc["moisture_dry"]   = DRY_VAL;           // Calibration dry value
  doc["moisture_wet"]   = WET_VAL;           // Calibration wet value
  doc["pump_on"]        = pumpOn;            // true/false
  doc["pump_mode"]      = getPumpModeStr();  // "normal"/"forceon"/"forceoff"
  doc["ip"]             = WiFi.localIP().toString();
  doc["uptime_s"]       = millis() / 1000;
  doc["rssi"]           = WiFi.RSSI();

  String response;
  serializeJson(doc, response);

  // CORS headers so browser can fetch this
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET");
  server.sendHeader("Cache-Control", "no-cache");
  server.send(200, "application/json", response);
}

// ══════════════════════════════════════════
// STEP 3: Register the route in your setup()
// Add these lines inside your setup() function:
// ══════════════════════════════════════════

/*
  In your setup():
  
    server.on("/",        handleRoot);        // Main page
    server.on("/normal",  handleNormal);      // SET MODE: AUTO
    server.on("/forceon", handleForceOn);     // SET MODE: FORCE ON (RELAY TURNS ON)
    server.on("/forceoff", handleForceOff);   // SET MODE: FORCE OFF (RELAY TURNS OFF)
    server.on("/sensor",  handleSensor);      // JSON sensor data

  Example — your complete setup() should look like:
  
    void setup() {
      Serial.begin(115200);
      pinMode(MOTOR_PIN, OUTPUT);            // ← CRITICAL: Set relay pin as output
      pinMode(SOIL_PIN, INPUT);              // ← Add soil sensor pin
      digitalWrite(MOTOR_PIN, LOW);          // ← Start with relay OFF
      
      WiFi.begin(ssid, password);
      while (WiFi.status() != WL_CONNECTED) delay(500);
      
      // Register all HTTP endpoints
      server.on("/",        handleRoot);
      server.on("/normal",  handleNormal);
      server.on("/forceon", handleForceOn);   // <- This turns RELAY ON
      server.on("/forceoff", handleForceOff); // <- This turns RELAY OFF
      server.on("/sensor",  handleSensor);
      
      server.begin();
    }
    
  And in loop():
  
    void loop() {
      server.handleClient();
      
      // If in force mode, keep relay state
      if (pumpMode == 1) digitalWrite(MOTOR_PIN, HIGH);   // Force ON
      if (pumpMode == 2) digitalWrite(MOTOR_PIN, LOW);    // Force OFF
      
      // Auto mode: check soil and control pump
      if (pumpMode == 0) {
        int pct = readSoilMoisturePct();
        bool shouldPump = (pct < 40);  // Turn on when dry
        digitalWrite(MOTOR_PIN, shouldPump ? HIGH : LOW);
      }
      delay(100);
    }
*/

// ══════════════════════════════════════════
// STEP 4: Test the endpoints directly in browser
// After flashing, after ESP32 connects to WiFi:
//   http://10.57.97.215/           → Main page (shows current status)
//   http://10.57.97.215/sensor     → JSON sensor data
//   http://10.57.97.215/normal     → Set to Auto mode
//   http://10.57.97.215/forceon    → TURN RELAY ON (Motor on)
//   http://10.57.97.215/forceoff   → TURN RELAY OFF (Motor off)
//
// Expected responses:
// - /forceon  → HTML page showing "Mode: FORCE ON", "Pump: ON", "GPIO State: HIGH"
// - /forceoff → HTML page showing "Mode: FORCE OFF", "Pump: OFF", "GPIO State: LOW"
// - /normal   → HTML page showing "Mode: NORMAL (Auto)", "GPIO State: HIGH/LOW (depends on soil)"
//
// The dashboard app uses the proxy: /hw/forceon → http://10.57.97.215/forceon
//
// ══════════════════════════════════════════
// STEP 5: Dashboard integration
// The web app at http://localhost:3000/ will:
// 1. Fetch /hw/sensor every 4 seconds to get soil moisture & pump status
// 2. When user clicks "Motor ON" button → Sends fetch to /hw/forceon
// 3. Arduino receives /forceon → Sets pumpMode=1 & GPIO=HIGH → Relay turns ON
// 4. When user clicks "Motor OFF" button → Sends fetch to /hw/forceoff
// 5. Arduino receives /forceoff → Sets pumpMode=2 & GPIO=LOW → Relay turns OFF
// ══════════════════════════════════════════

// Expected JSON /sensor endpoint:
// {
//   "moisture_pct": 72,
//   "moisture_raw": 2156,
//   "moisture_dry": 3200,
//   "moisture_wet": 1200,
//   "pump_mode": "normal",
//   "ip": "10.57.97.215",
//   "uptime_s": 4721,
//   "rssi": -58
// }
// ══════════════════════════════════════════

// ══════════════════════════════════════════════════════════
// FULL SKETCH EXAMPLE (if you need to rewrite from scratch):
// ══════════════════════════════════════════════════════════
/*
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

#define SOIL_PIN  34
#define MOTOR_PIN 2

const int DRY_VAL = 3200;
const int WET_VAL = 1200;
const int THRESHOLD = 40;    // Auto-pump threshold (%)

int pumpMode = 0; // 0=auto, 1=forceOn, 2=forceOff

WebServer server(80);

int readSoilMoisturePct() {
  long sum = 0;
  for (int i = 0; i < 10; i++) { sum += analogRead(SOIL_PIN); delay(5); }
  int raw = sum / 10;
  return constrain(map(raw, DRY_VAL, WET_VAL, 0, 100), 0, 100);
}

void sendPage() {
  int pct = readSoilMoisturePct();
  bool on = (pumpMode==1)||(pumpMode==0 && pct < THRESHOLD);
  String html = "<!DOCTYPE html><html><body style='font-family:monospace;background:#0a0a0a;color:#0f0'>";
  html += "<h2>Smart Irrigation System</h2>";
  html += "<p>Soil Moisture: <b>" + String(pct) + "%</b></p>";
  html += "<p>Pump: <b>" + String(on?"ON":"OFF") + "</b></p>";
  html += "<a href='/normal'>Normal ON</a> | ";
  html += "<a href='/forceon'>Force ON</a> | ";
  html += "<a href='/forceoff'>Force OFF</a>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

void handleSensor() {
  int raw = analogRead(SOIL_PIN);
  int pct = constrain(map(raw, DRY_VAL, WET_VAL, 0, 100), 0, 100);
  bool on = (pumpMode==1)||(pumpMode==0 && pct < THRESHOLD);
  String mode = pumpMode==1?"forceon":pumpMode==2?"forceoff":"normal";

  StaticJsonDocument<256> doc;
  doc["moisture_pct"] = pct;
  doc["moisture_raw"] = raw;
  doc["pump_on"]      = on;
  doc["pump_mode"]    = mode;
  doc["rssi"]         = WiFi.RSSI();
  doc["uptime_s"]     = millis()/1000;
  doc["ip"]           = WiFi.localIP().toString();

  String resp; serializeJson(doc, resp);
  server.sendHeader("Access-Control-Allow-Origin","*");
  server.send(200,"application/json",resp);
}

void setup() {
  Serial.begin(115200);
  pinMode(MOTOR_PIN, OUTPUT);
  pinMode(SOIL_PIN, INPUT);
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nIP: " + WiFi.localIP().toString());

  server.on("/",        []{ sendPage(); });
  server.on("/normal",  []{ pumpMode=0; sendPage(); });
  server.on("/forceon", []{ pumpMode=1; sendPage(); });
  server.on("/forceoff",[]{ pumpMode=2; sendPage(); });
  server.on("/sensor",  handleSensor);
  server.begin();
}

void loop() {
  server.handleClient();
  int pct = readSoilMoisturePct();
  bool shouldPump = (pumpMode==1)||(pumpMode==0 && pct < THRESHOLD);
  digitalWrite(MOTOR_PIN, shouldPump ? HIGH : LOW);
  delay(100);
}
*/
