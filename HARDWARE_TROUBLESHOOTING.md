# Hardware Control Troubleshooting Guide

## Quick Status Check

When you click the **Debug** button on the Hardware Control page, you'll see real-time logs of all HTTP requests to your ESP32. This helps identify where the communication is breaking down.

## Testing Hardware Responsiveness

### Step 1: Verify ESP32 is Online
1. Open the Hardware Control page: `http://localhost:3000/hardwarecontrol`
2. Look at the header - it should show `✅ Online` if the ESP32 is reachable
3. Click **Debug** to see detailed logs

### Step 2: Check Motor Control Communication

When you click any button (Auto Mode, Force ON, Force OFF):

1. **Check the Debug Logs** - You should see:
   - `ACTION_NORMAL` / `ACTION_FORCEON` / `ACTION_FORCEOFF` logs
   - Status should be `SUCCESS` (HTTP response received)
   
2. **Expected Log Sequence**:
   ```
   00:00:00 SUCCESS ACTION_NORMAL - Command sent successfully (200 OK)
   00:00:01 SUCCESS FETCH_DATA - Data received - Motor: ON, Moisture: 2500
   ```

3. **If you see ERROR status**:
   - Check the error message in the debug panel
   - Common errors:
     - `HTTP 0: ` - Network unreachable (ESP32 offline or wrong IP)
     - `Network Error` - WiFi connectivity issue
     - `HTTP 404: ` - Endpoint doesn't exist on ESP32

### Step 3: Check Motor Actually Turns On/Off

After clicking a button and seeing SUCCESS in the logs:

1. **Watch the Motor Status** - Should change from `OFF → ON` or `ON → OFF`
2. **Listen for relay click** - You should hear a click sound from the relay module
3. **Check motor physically** - Should start spinning (if water pump) or moving

### Common Issues & Solutions

#### Issue 1: "❌ Offline" Status
**Problem**: Can't reach the ESP32 at all

**Checklist**:
- [ ] Is ESP32 powered on?
- [ ] Is ESP32 connected to WiFi? (Check LED indicator on board)
- [ ] Is the IP address `10.57.97.215` correct?
- [ ] Are you on the same network as the ESP32?
- [ ] Is the firewall blocking port 80?

**Fix**:
1. Verify ESP32 WiFi connection: Check your router's connected devices
2. If IP changed, find it on your network and update `HARDWARE_IP` in:
   - `pages/HardwareControl.tsx` (line 4)
   - `pages/HardwareDashboard.tsx` (line 4)

#### Issue 2: Buttons Work but Motor Doesn't Move
**Problem**: Logs show SUCCESS, but motor doesn't respond

**Checklist**:
- [ ] Is the motor connected to power?
- [ ] Is the relay module powered?
- [ ] Are GPIO connections correct? (Relay pin should be GPIO 26)
- [ ] Motor power jumper is set correctly?

**Debug Steps**:
1. Check if Motor Status indicator changes in the UI (should switch ON/OFF)
2. Test the relay directly:
   - Use a multimeter to check GPIO 26 voltage
   - Should go LOW (0V) when ON, HIGH (3.3V) when OFF
3. Listen closely for relay click - indicates GPIO is working

#### Issue 3: Data Loads but Buttons Don't Send Commands
**Problem**: Sensor data shows (moisture, temp, etc.) but buttons give errors

**Checklist**:
- [ ] Debug logs show `ACTION_*` entries with `ERROR` status?
- [ ] Error message mentions "CORS" or "network"?

**Fix**:
- This is a network issue between your browser and ESP32
- Make sure you're on the same WiFi network
- Try accessing ESP32 directly: Open browser tab and go to `http://10.57.97.215/`
- If that works, data fetching works too (same endpoint)

#### Issue 4: Only Some Endpoints Work
**Problem**: Auto Mode works but Force buttons don't

**Check**:
1. Verify ESP32 has these endpoints:
   - `GET /` - Data page (returns HTML with sensor data)
   - `GET /normal` - Auto mode
   - `GET /forceon` - Force motor ON
   - `GET /forceoff` - Force motor OFF

2. If missing, re-upload the ESP32 code with all endpoints

### Manual Testing from Browser

You can test the ESP32 endpoints directly without the React app:

1. **Get sensor data**:
   ```
   Open in browser: http://10.57.97.215:80/
   ```
   Should show HTML with: Moisture, Temperature, Humidity, Motor status, Mode

2. **Send auto mode command**:
   ```
   Open in browser: http://10.57.97.215:80/normal
   ```
   Should return: "Mode set to AUTO"

3. **Force motor ON**:
   ```
   Open in browser: http://10.57.97.215:80/forceon
   ```
   Should return: "Motor: ON" and relay clicks

4. **Force motor OFF**:
   ```
   Open in browser: http://10.57.97.215:80/forceoff
   ```
   Should return: "Motor: OFF" and relay clicks

### Advanced Debugging

#### Enable Console Logging
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Click a hardware control button
4. Look for log messages starting with `[ACTION_` 

**Example console output**:
```
[ACTION_FORCEON] PENDING: Sending FORCE ON command to http://10.57.97.215:80/forceon
[ACTION_FORCEON] SUCCESS: Command sent successfully (200 OK)
[FETCH_DATA] PENDING: Fetching from http://10.57.97.215:80/
[FETCH_DATA] SUCCESS: Data received - Motor: ON, Moisture: 2500
```

#### Check Network Traffic (Browser DevTools)
1. Press F12 to open Developer Tools
2. Go to Network tab
3. Click a hardware control button
4. Look for requests to `10.57.97.215`
5. Check Status column:
   - `200` = Success
   - `0` = Network error
   - `404` = Endpoint not found

## ESP32 Hardware Verification Checklist

Before testing web control, verify ESP32 is properly set up:

- [ ] **Power**: ESP32 has power (check USB or power connector)
- [ ] **Serial Monitor**: Shows startup messages at 115200 baud
- [ ] **WiFi**: Connected to SSID "sachin" (check with IP scanner)
- [ ] **Sensors**: DHT11 connected to GPIO 4
- [ ] **Soil Moisture**: Sensor connected to GPIO 34 (analog)
- [ ] **Relay**: Connected to GPIO 26 with proper pull-up resistor
- [ ] **Motor Power**: External 12V/5V connected to relay input (not GPIO!)
- [ ] **Relay Testing**: Relay clicks when GPIO 26 goes LOW

## Quick Reference: Hardware Endpoints

| Endpoint   | Method | Response | Action |
|-----------|--------|----------|--------|
| `/`       | GET    | HTML     | Returns sensor data and motor status |
| `/normal` | GET    | Text     | Sets motor to AUTO mode |
| `/forceon`| GET    | Text     | Forces motor ON immediately |
| `/forceoff`| GET   | Text     | Forces motor OFF immediately |

## Hardware IP Configuration

**Current IP**: `10.57.97.215:80`

To find or change the IP:
1. Check your router's connected devices list
2. Look for "esp32" or start with "192.168.x.x" pattern
3. If changed, update in:
   - `pages/HardwareControl.tsx` - Line 4
   - `pages/HardwareDashboard.tsx` - Line 4

## Need More Help?

1. **Check debug logs** - Click Debug button in Hardware Control page
2. **Test endpoints manually** - Try accessing them directly in browser
3. **Verify network** - Ensure computer and ESP32 are on same WiFi
4. **Check power** - Make sure all devices (ESP32, relay, motor) are powered
5. **Review ESP32 logs** - Connect via serial and check for errors

For ESP32 code issues, refer to `ESP32_SENSOR_CODE_ENHANCED.ino`
