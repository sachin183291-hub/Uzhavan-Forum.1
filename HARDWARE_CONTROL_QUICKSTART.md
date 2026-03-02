# Hardware Control - Quick Start Guide

## ✅ Status: ESP32 is Online and Responding!

The ESP32 at `10.57.97.215:80` is **online** and responding to requests with HTTP 200 status.

## How to Test Motor Control

### 1. Go to Hardware Control Page
```
http://localhost:3000/hardwarecontrol
```

### 2. Enable Debug Mode
Click the **🔓 Debug** button in the top right corner. This shows real-time logs of all hardware commands.

### 3. Test Motor Control

**Click these buttons and watch the Debug logs:**

| Button | What It Does | Expected Result |
|--------|------------|-----------------|
| **Auto Mode** | Motor turns ON when soil is DRY | Motor state changes based on moisture |
| **Force ON** | Motor turns ON immediately | Debug shows SUCCESS, motor indicator turns green |
| **Force OFF** | Motor turns OFF immediately | Debug shows SUCCESS, motor indicator turns red |

### 4. Check Debug Logs

When you click a button, you should see in the Debug panel:

```
00:00:00  SUCCESS  ACTION_FORCEON - Command sent successfully (200 OK)
00:00:01  SUCCESS  FETCH_DATA - Data received - Motor: ON, Moisture: 2500
```

### 5. Verify Physical Motor Response

After clicking a button:
1. **Listen** - You should hear a relay click sound
2. **Watch** - Motor/pump should start or stop moving
3. **Check UI** - Motor Status should update to ON/OFF

## What Each Debug Status Means

| Status | Meaning | Action |
|--------|---------|--------|
| 🟡 **PENDING** | Command is being sent | Wait a moment |
| 🟢 **SUCCESS** | Command reached ESP32 (HTTP 200) | Motor should respond next |
| 🔴 **ERROR** | Request failed | Check error message details |

## Troubleshooting

### Sensor Data Shows but Motor Doesn't Respond

**Problem**: Debug shows SUCCESS but motor doesn't move

**Checklist**:
1. Is the relay module powered? (Check power LED)
2. Is GPIO 26 connected to relay signal pin?
3. Is motor power connected to relay output (not ESP32)?
4. Did you hear a relay click?

**Test relay directly**:
- Visit: `http://10.57.97.215/forceon` in your browser
- You should hear a distinct click from the relay

### No Connection to ESP32

**Problem**: Status shows ❌ Offline or error in debug logs

**Checklist**:
1. Is ESP32 powered on?
2. Is it connected to WiFi? (Check LED indicator)
3. Is IP `10.57.97.215` correct?
4. Are you on the same WiFi network?

**Find correct IP**:
- Check your router's connected devices
- Look for device named "esp32" or similar
- Update IP in `pages/HardwareControl.tsx` line 4 if needed

## Direct Testing (No React App)

Test the ESP32 endpoints directly in your browser:

1. **Check data**: `http://10.57.97.215`
2. **Force ON**: `http://10.57.97.215/forceon`
3. **Force OFF**: `http://10.57.97.215/forceoff`
4. **Auto mode**: `http://10.57.97.215/normal`

If these work, then the web interface will also work.

## Features Added in This Update

✅ **Real-time Debug Logs** - See every command sent to ESP32  
✅ **Detailed Error Messages** - Know exactly what failed  
✅ **Auto Refresh** - Data updates every 3 seconds  
✅ **Direct ESP32 Link** - One-click access to ESP32 web page  
✅ **Motor Status Indicator** - Real-time ON/OFF display  
✅ **Connection Status** - See if hardware is online  

## Next Steps

1. **Test each button** and check Debug logs
2. **Listen for relay click** when sending commands
3. **Watch motor movement** to confirm control
4. **Refer to HARDWARE_TROUBLESHOOTING.md** if issues persist

---

**Hardware IP**: `10.57.97.215:80`  
**Connection Status**: ✅ Online (HTTP 200)  
**Last Updated**: Today
