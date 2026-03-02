🔧 MOTOR OFF 404 ERROR - DIAGNOSTIC GUIDE

═══════════════════════════════════════════════════════════════════════════════

ERROR: [CMD] ✗ Motor OFF FAILED after 3 attempts: HTTP 404 Not Found

MEANING: The ESP32 endpoint `/forceoff` is not responding or hardware is offline

═══════════════════════════════════════════════════════════════════════════════

🔍 STEP 1: Check Hardware Status

In your browser, try these endpoints directly:

✓ Check if ESP32 is online:
  http://10.57.97.215/

✓ Get sensor data (JSON):
  http://10.57.97.215/sensor

✓ Test debug endpoint:
  http://10.57.97.215/debug

✓ Test FORCEON (should work):
  http://10.57.97.215/forceon

✓ Test FORCEOFF (the problematic one):
  http://10.57.97.215/forceoff

If ANY of these return "Cannot GET" or "404", the ESP32 is offline or 
the endpoints aren't registered.

═══════════════════════════════════════════════════════════════════════════════

🔍 STEP 2: Check Arduino Serial Output

1. Open Arduino IDE
2. Select your ESP32 COM port
3. Open Serial Monitor (115200 baud)
4. Look for startup messages like:
   - "[SETUP] Web server started on port 80"
   - "Connected!" with IP address
   - "[SETUP] ✓ System initialized"

If you see these, ESP32 is running correctly.

Did you see "Motor OFF FAILED" in logs? The endpoint should be registered.

═══════════════════════════════════════════════════════════════════════════════

🔍 STEP 3: Verify Endpoint is Registered

In Arduino Serial Monitor, you should see logs like:
  [AXIS] Motor: FORCE OFF - GPIO set to HIGH

If clicking the dashboard "Motor OFF" button causes NO serial output,
the endpoint handler isn't being called.

═══════════════════════════════════════════════════════════════════════════════

❌ COMMON CAUSES & FIXES

1. ❌ ESP32 OFFLINE
   Symptom: "Cannot reach http://10.57.97.215"
   Fix: 
     • Check ESP32 power supply
     • Verify WiFi SSID/password in code
     • Re-upload ESP32_SENSOR_CODE_ENHANCED.ino
     • Check WiFi router connected

2. ❌ ENDPOINT NOT REGISTERED
   Symptom: "Cannot GET /forceoff" from ESP32
   Fix:
     • Re-upload Arduino code (may not have compiled properly)
     • Check for syntax errors in ESP32_SENSOR_CODE_ENHANCED.ino
     • Verify all handlers are in setup()

3. ❌ PROXY NOT CONFIGURED
   Symptom: "404 from vite proxy"
   Fix:
     • Check vite.config.ts proxy settings
     • Ensure /hw proxy target is http://10.57.97.215
     • Restart frontend: npm run dev

4. ❌ WRONG IP ADDRESS
   Symptom: "Connection refused"
   Fix:
     • Verify ESP32 IP: http://esp32ip/
     • Update hardcoded IP in code (currently 10.57.97.215)
     • Check AxisDashboard.tsx HARDWARE_IP constant

5. ❌ FIREWALL BLOCKING
   Symptom: "Timeout on /forceoff"
   Fix:
     • Disable Windows Firewall (temporarily)
     • Ensure ESP32 and computer on same network
     • Use WiFi instead of Ethernet if available

═══════════════════════════════════════════════════════════════════════════════

✅ TROUBLESHOOTING CHECKLIST

□ ESP32 powered on and WiFi LED blinking
□ Serial Monitor shows successful connection
□ http://10.57.97.215/ returns HTML status page
□ http://10.57.97.215/sensor returns JSON
□ http://10.57.97.215/forceoff returns HTML
□ vite.config.ts proxy target is correct
□ Frontend server running (localhost:3000)
□ No firewall blocking 10.57.97.215:80
□ Arduino code uploaded to correct COM port
□ Relay module GPIO pin is 26 (check code)
□ Motor/pump power supply connected

═══════════════════════════════════════════════════════════════════════════════

🛠️ QUICK FIX: Re-upload Arduino Code

1. Open ESP32_SENSOR_CODE_ENHANCED.ino in Arduino IDE
2. Select Board: ESP32 Dev Module
3. Select COM port (your ESP32)
4. Click Upload
5. Watch Serial Monitor for [SETUP] messages
6. Try Motor OFF again

═══════════════════════════════════════════════════════════════════════════════

🔧 QUICK FIX: Restart Services

1. Stop frontend: Ctrl+C in terminal
2. Stop backend: Ctrl+C in other terminal
3. Power cycle ESP32 (unplug/replug)
4. Wait 10 seconds
5. npm run dev:all
6. Try Motor OFF again

═══════════════════════════════════════════════════════════════════════════════

📊 TEST: Check Console Logs

After clicking "Motor OFF", check browser DevTools (F12):
- Console tab should show no errors
- Network tab should show request to /hw/forceoff
- Response should be HTML or JSON (not 404)

If response is 404:
  → ESP32 endpoint not responding
  → Hardware IP might be wrong
  → Endpoint handler not registered

═══════════════════════════════════════════════════════════════════════════════

📝 DEBUG LOG ENTRY ADDED

The updated code now logs:
  [CMD] ✗ HTTP error: 404
  [CMD] Endpoint: http://localhost:3000/hw/forceoff

This helps identify if the issue is:
- Proxy path rewriting (is /fw/forceoff reaching /forceoff?)
- Hardware offline (is 10.57.97.215 reachable?)
- Endpoint not registered (does handleForceOff exist?)

═══════════════════════════════════════════════════════════════════════════════

🆘 STILL NOT WORKING?

Run these commands to diagnose:

From Windows PowerShell:
  # Test if ESP32 is online
  ping 10.57.97.215

  # Try direct ESP32 endpoint
  curl http://10.57.97.215/forceoff

  # Check if proxy is working
  curl http://localhost:3000/hw/debug

  # View Arduino Serial (if you have USB)
  # Arduino IDE → Tools → Serial Monitor (115200 baud)

═══════════════════════════════════════════════════════════════════════════════

📞 IF ISSUE PERSISTS:

1. Check if ESP32 was ever working (did FORCEON work before?)
2. Verify GPIO 26 relay wiring
3. Check Arduino Serial output for errors
4. Look for timeout/timeout error messages
5. Try different USB cable/port if using programmer

═══════════════════════════════════════════════════════════════════════════════

FILES UPDATED WITH BETTER ERROR HANDLING:

✅ ESP32_SENSOR_CODE_ENHANCED.ino
   - Fixed handleForceOff() response
   - Added /debug endpoint for testing
   - Better error messages

✅ pages/AxisDashboard.tsx  
   - Added console.log with response details
   - Better error logging in logs panel
   - Shows actual endpoint URL being called

═══════════════════════════════════════════════════════════════════════════════

Next Steps:

1. Try direct endpoint: http://10.57.97.215/forceoff
2. Check browser console (F12) for network details
3. Re-upload Arduino code if not working
4. Report what you see in Serial Monitor

═══════════════════════════════════════════════════════════════════════════════
