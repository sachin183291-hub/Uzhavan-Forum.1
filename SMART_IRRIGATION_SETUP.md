# Smart Irrigation System - Complete Setup Guide

## 📋 Overview

This is a complete React + Node.js smart irrigation system with hardware login integration for ESP32-based soil moisture monitoring and automated motor control.

### Components:
- **Frontend**: React 18.2 web interface
- **Backend**: Node.js Express API server
- **Hardware**: ESP32 microcontroller with DHT11 & soil moisture sensor
- **Authentication**: Multi-factor (username/password → OTP → biometric)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install both frontend and backend dependencies:
- **Frontend**: React, Vite, Router, Tailwind utilities
- **Backend**: Express, CORS, Axios, Dotenv

### 2. Configure Environment

Create `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

### 3. Update Hardware IP

Edit these files if using different IP:
- `vite.config.ts` - Update proxy target
- `server.js` - Update `HARDWARE_IP` constant
- `ESP32_SENSOR_CODE.ino` - Update WiFi credentials

Current IP: `10.57.97.215`

### 4. Start Development Servers

**Option A: Run Frontend Only**
```bash
npm run dev
```
Access: `http://localhost:3000`

**Option B: Run Frontend + Backend**
```bash
npm run dev:all
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

**Option C: Run Backend Only**
```bash
npm run dev:server
```
API runs at: `http://localhost:5000`

---

## 📁 Project Structure

```
├── pages/
│   ├── AxisLogin.tsx          # Hardware authentication
│   ├── AxisDashboard.tsx      # Original dashboard
│   └── SmartIrrigation.tsx    # NEW - Smart irrigation UI
├── utils/
│   ├── genai.ts               # AI integration (existing)
│   └── smartIrrigationApi.ts  # NEW - API client
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── Guardian3DViewer.tsx
├── context/
│   ├── LanguageContext.tsx
│   └── CartContext.tsx
├── server.js                  # NEW - Node.js Express API
├── ESP32_SENSOR_CODE.ino      # Arduino firmware
├── vite.config.ts
├── package.json               # Updated with backend deps
├── tsconfig.json
└── index.tsx
```

---

## 🔌 Arduino Setup

### Hardware Connections

```
           ESP32
     ┌────────────┐
GPIO 34 ─── Soil Moisture Sensor (analog)
GPIO 4  ─── DHT11 (digital)
GPIO 26 ─── Relay Module (motor control)
GND  ─── Common Ground
```

### Upload Firmware

1. Install Arduino IDE
2. Install ESP32 board support
3. Open `ESP32_SENSOR_CODE.ino`
4. Update WiFi credentials:
   ```cpp
   const char* ssid = "sachin";
   const char* password = "sachin123";
   ```
5. Select Board: ESP32 DevKit
6. Click Upload

### Verify Connection

Check Serial Monitor:
```
Connecting to WiFi.....
Connected!
IP: 10.57.97.215
```

---

## 🔑 Authentication Flow

### Login Credentials

Multi-role system:
- **Admin**: `axis_admin` / `axis2025` → Full access
- **Operator**: `axis_op` / `op@2025` → Read & Write
- **Guest**: `axis_guest` / `guest123` → Read-only

### Authentication Steps

1. **Username/Password**
   - POST `/api/auth/login`
   - Returns: `token`, `role`, `permissions`

2. **OTP Verification** (Optional)
   - POST `/api/auth/otp`
   - Test OTP: `123456`

3. **Biometric** (Optional)
   - POST `/api/auth/biometric`
   - Provides additional security

4. **Session Token**
   - Used in all subsequent API calls
   - Header: `x-session-token: <token>`

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication

```
POST /auth/login
POST /auth/otp
POST /auth/biometric
POST /auth/logout
```

### Sensors

```
GET  /hardware/sensors       # Get real-time sensor data
GET  /hardware/status        # Get system status
```

### Motor Control

```
POST /hardware/motor/on      # Turn motor ON
POST /hardware/motor/off     # Turn motor OFF
POST /hardware/motor/auto    # Enable AUTO mode
POST /hardware/motor/manual  # Enable MANUAL mode
```

### Configuration

```
GET  /hardware/config                # Get config
POST /hardware/config/update         # Update config
```

### Alerts

```
POST /alerts/sms             # Send SMS alert
```

### Health

```
GET  /health                 # API health check
```

---

## 📊 Sensor Data Format

### Real-time Sensor Response

```json
{
  "success": true,
  "data": {
    "moisture_pct": 65,
    "moisture_raw": 2200,
    "temperature": 28.5,
    "humidity": 72,
    "pump_mode": "normal",
    "rssi": -45,
    "uptime_s": 3600,
    "ip": "10.57.97.215"
  },
  "timestamp": "2026-02-28T10:30:00.000Z"
}
```

### Motor Control Response

```json
{
  "success": true,
  "message": "Motor turned ON",
  "mode": "forceon",
  "response": "<html>...</html>",
  "timestamp": "2026-02-28T10:30:05.000Z"
}
```

---

## 🎛️ Motor Control Modes

### AUTO Mode
- Automatically controls pump based on soil moisture
- Threshold: 40% (turns ON when dry, OFF when wet)
- Endpoint: `/normal`

### FORCE ON
- Manually turn motor ON regardless of soil moisture
- Endpoint: `/forceon`

### FORCE OFF
- Manually turn motor OFF regardless of soil moisture
- Endpoint: `/forceoff`

---

## 🌡️ Sensor Calibration

### Soil Moisture

Located in `ESP32_SENSOR_CODE.ino`:
```cpp
#define DRY_VAL 3200    // ADC value when soil is dry
#define WET_VAL 1200    // ADC value when soil is wet
```

Calibration:
1. Place sensor in dry soil → Note ADC value → Set as DRY_VAL
2. Place sensor in wet soil → Note ADC value → Set as WET_VAL
3. Re-upload firmware

### Temperature & Humidity

DHT11 sensor attached to GPIO 4. Auto-calibrated.

---

## 🚨 Alert System

### SMS Alerts

Automatic alerts send when:
- Motor turns ON/OFF
- Soil moisture falls below 30%
- Temperature exceeds 35°C
- System errors occur

Configure:
1. Get Fast2SMS API key
2. Save in dashboard settings
3. Update phone number: `7358096768`

---

## 🔧 Troubleshooting

### Hardware Offline
```
Error: Failed to fetch sensor data
```
**Fix**: Verify ESP32 IP, WiFi connection, power

### Authentication Failed
```
Error: Invalid credentials
```
**Fix**: Check username/password in HARDWARE_USERS (server.js)

### Motor Not Responding
```
Error: Failed to turn motor ON
```
**Fix**: Check relay wiring, GPIO 26, motor power supply

### CORS Errors
```
Error: Block by CORS policy
```
**Fix**: Ensure Arduino returns CORS headers, backend running

### OTP Not Working
```
Error: Invalid OTP
```
**Fix**: Current test OTP is `123456`

---

## 📝 Key Files

### Frontend Components
- **SmartIrrigation.tsx**: Main UI dashboard
  - Real-time sensor display
  - Motor control buttons
  - System logs
  - Authentication check

- **AxisLogin.tsx**: Hardware login
  - Multi-factor authentication
  - OTP verification
  - Biometric confirmation

### Backend API
- **server.js**: Express API server
  - Authentication endpoints
  - Sensor data proxying
  - Motor control routing
  - Configuration management

### API Client
- **smartIrrigationApi.ts**: TypeScript API client
  - AuthAPI - Login, OTP, biometric
  - SensorAPI - Fetch sensor data
  - MotorAPI - Motor control
  - ConfigAPI - Configuration
  - AlertAPI - SMS alerts
  - SessionManager - Token storage

### Arduino Code
- **ESP32_SENSOR_CODE.ino**: Arduino sketch
  - WiFi connectivity
  - DHT11 reading
  - Soil moisture ADC
  - Relay GPIO control
  - HTTP server endpoints

---

## 🔐 Security Features

### Session Management
- 24-hour session expiry
- Token-based authentication
- Device fingerprinting support

### Role-Based Access Control
- Admin: Full permissions
- Operator: Read & Write
- Guest: Read-only

### CORS Protection
- Proper origin validation
- Credential handling
- Request validation

---

## 📱 Responsive Design

The UI is fully responsive:
- **Desktop**: Full dashboard view
- **Tablet**: 2-column layout
- **Mobile**: Single column, stackable

Uses Tailwind CSS for styling with dark theme.

---

## ⚙️ Configuration

### Hardware Config
```javascript
{
  hardwareIp: '10.57.97.215',
  moistureThreshold: 2500,
  temperatureUnit: 'C',
  humidityUnit: '%',
  pollInterval: 4000,           // 4 seconds
  retryAttempts: 3,
  retryDelay: 1500,             // 1.5 seconds
  commandTimeout: 8000          // 8 seconds
}
```

### Auto-Shutoff
- Threshold: 75% soil moisture
- Disabled in MANUAL mode
- Only active in AUTO mode

---

## 📚 API Usage Examples

### Get Sensor Data

```typescript
import { SensorAPI, SessionManager } from '@/utils/smartIrrigationApi';

const session = SessionManager.getSession();
const response = await SensorAPI.getSensorData(session!.token);

if (response.success) {
  console.log('Moisture:', response.data.moisture_pct, '%');
  console.log('Temperature:', response.data.temperature, '°C');
}
```

### Control Motor

```typescript
import { MotorAPI } from '@/utils/smartIrrigationApi';

const response = await MotorAPI.turnOn(session!.token);
if (response.success) {
  console.log('Motor ON:', response.message);
}
```

### Login

```typescript
import { AuthAPI, SessionManager } from '@/utils/smartIrrigationApi';

const response = await AuthAPI.login('axis_admin', 'axis2025');
if (response.success) {
  SessionManager.saveSession({
    token: response.data.token,
    username: response.data.user.username,
    role: response.data.user.role,
    permissions: response.data.user.permissions
  });
}
```

---

## 🧪 Testing

### Test Endpoints

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"axis_admin","password":"axis2025"}'

# Get sensors (replace TOKEN)
curl http://localhost:5000/api/hardware/sensors \
  -H "x-session-token: TOKEN"

# Turn motor on
curl -X POST http://localhost:5000/api/hardware/motor/on \
  -H "x-session-token: TOKEN"
```

---

## 📦 Building for Production

```bash
# Build frontend
npm run build

# Output in: dist/

# Build backend (if needed)
# Backend is JavaScript, no build required
```

---

## 🔄 Real-time Updates

The SmartIrrigation component polls sensors every 4 seconds:
```typescript
setInterval(() => {
  fetchSensorData();  // Automatic updates
}, 4000);
```

Polling uses exponential backoff when hardware is offline.

---

## 📞 Support

### Check Hardware Connection
1. SSH to ESP32: `ssh root@10.57.97.215`
2. Check WiFi: `iwconfig`
3. Check IP: `hostname -I`
4. Check relay GPIO: `gpio readall | grep GPIO26`

### View Arduino Logs
1. Open Arduino Serial Monitor
2. View debug messages: `[AXIS] Motor: FORCE ON - GPIO set to HIGH`

### Enable Debug Logging
Add to server.js:
```javascript
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
```

---

## 📄 License

Proprietary - UzhavanForum Agricultural Platform

---

## 🎉 Next Steps

1. ✅ Configure WiFi credentials in Arduino
2. ✅ Upload firmware to ESP32
3. ✅ Start Node.js backend: `npm run dev:server`
4. ✅ Start React frontend: `npm run dev`
5. ✅ Login via AXIS at `http://localhost:3000/axis-login`
6. ✅ Navigate to Smart Irrigation dashboard
7. ✅ Test motor controls
8. ✅ Configure SMS alerts
9. ✅ Set up auto-shutoff thresholds

---

**Last Updated**: February 28, 2026
**Version**: 1.0.0
