# 🌱 Smart Irrigation System - Complete React + Node.js + ESP32 Solution

A comprehensive IoT smart irrigation platform for agricultural monitoring and automated motor control using React frontend, Node.js backend, and ESP32 microcontroller hardware.

## 📚 Documentation Files Created

### Core Implementation Files
- **`pages/SmartIrrigation.tsx`** - React dashboard component with:
  - Real-time sensor monitoring (moisture, temperature, humidity)
  - Motor control buttons (ON/OFF/AUTO/MANUAL)
  - System logs and status display
  - Multi-user authentication integration
  - Responsive dark UI with Tailwind CSS

- **`server.js`** - Node.js Express API server with:
  - Multi-factor authentication (username/password → OTP → biometric)
  - Role-based access control (Admin/Operator/Guest)
  - Hardware sensor data proxying
  - Motor control endpoints with retry logic
  - Configuration management
  - SMS alert integration
  - Health check endpoint

- **`utils/smartIrrigationApi.ts`** - TypeScript API client providing:
  - AuthAPI - Login, OTP, biometric verification
  - SensorAPI - Real-time sensor data fetching
  - MotorAPI - Motor control (ON/OFF/AUTO/MANUAL)
  - ConfigAPI - Hardware configuration management
  - AlertAPI - SMS notifications
  - SessionManager - Token storage and retrieval

- **`ESP32_SENSOR_CODE_ENHANCED.ino`** - Complete Arduino firmware with:
  - WiFi connectivity
  - DHT11 temperature/humidity sensor reading
  - Soil moisture ADC with auto-calibration
  - Relay motor control with GPIO stabilization
  - JSON sensor endpoint
  - HTTP web interface with status page
  - CORS headers for browser access
  - 4 control modes: AUTO, FORCE ON, FORCE OFF, MANUAL
  - Auto shutoff at 75% soil moisture

### Setup & Documentation
- **`SMART_IRRIGATION_SETUP.md`** - Comprehensive 40+ section setup guide covering:
  - Quick start instructions
  - Hardware connections and wiring diagram
  - Arduino firmware upload process
  - API endpoint documentation
  - Authentication flow explanation
  - Sensor data formats
  - Motor control modes
  - Troubleshooting guide
  - Configuration options
  - Security features

- **`INTEGRATION_GUIDE.md`** - Integration instructions with:
  - Step-by-step route integration
  - Navigation menu updates
  - Custom authentication hooks
  - Protected route components
  - API usage examples
  - Complete example App.tsx
  - Advanced feature suggestions
  - Troubleshooting tips

- **`setup-smart-irrigation.sh`** - Automated setup script for:
  - Dependency installation
  - Environment configuration
  - File creation verification
  - Hardware configuration checklist

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development
```bash
# Both frontend and backend
npm run dev:all

# Or separately
npm run dev              # Frontend: http://localhost:3000
npm run dev:server       # Backend: http://localhost:5000
```

### 3. Access the Application
- **Login**: http://localhost:3000/axis-login
- **Dashboard**: http://localhost:3000/smart-irrigation
- **API**: http://localhost:5000/api

### 4. Test Credentials
```
Admin:     axis_admin / axis2025
Operator:  axis_op / op@2025
Guest:     axis_guest / guest123
OTP:       123456 (for testing)
```

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Frontend                          │
│              (React 18.2 + Tailwind CSS)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SmartIrrigation Component                           │   │
│  │  - Real-time sensor display                          │   │
│  │  - Motor control buttons                             │   │
│  │  - System logs                                       │   │
│  │  - User authentication checks                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
        ┌───────────────────────────────────────────┐
        │   Node.js Express API Server (Port 5000)  │
        │  smartIrrigationApi.ts (Client Library)   │
        │                                            │
        │  ✓ Authentication (Login/OTP/Biometric)   │
        │  ✓ Sensor endpoints (/sensor, /status)    │
        │  ✓ Motor control (/motor/on|off|auto)     │
        │  ✓ Configuration management                │
        │  ✓ Role-based access control               │
        │  ✓ Session management                      │
        └───────────────────────────────────────────┘
                 ↕ HTTP (ESP32 at 10.57.97.215)
        ┌───────────────────────────────────────────┐
        │      ESP32 Microcontroller Hardware         │
        │   ESP32_SENSOR_CODE_ENHANCED.ino            │
        │                                             │
        │  ✓ WiFi connectivity                        │
        │  ✓ DHT11 temp/humidity sensor               │
        │  ✓ Soil moisture ADC (GPIO 34)              │
        │  ✓ Relay motor control (GPIO 26)            │
        │  ✓ HTTP server (port 80)                    │
        │  ✓ JSON sensor endpoint                     │
        │  ✓ 4 control modes                          │
        └───────────────────────────────────────────┘
                        ↕ GPIO/Power
        ┌───────────────────────────────────────────┐
        │        Physical Hardware Components         │
        │                                             │
        │  • DHT11 (GPIO 4)    - Temp/Humidity       │
        │  • Soil Sensor (GPIO 34) - Moisture ADC    │
        │  • Relay Module (GPIO 26) - Motor Control  │
        │  • DC Motor with pump                       │
        │  • Power supply                             │
        └───────────────────────────────────────────┘
```

## 🔑 Key Features

### 1. Real-Time Monitoring
- Soil moisture percentage (0-100%)
- Temperature (°C) via DHT11
- Humidity (%) via DHT11
- WiFi signal strength (dBm)
- System uptime
- Motor status

### 2. Motor Control
| Mode | Behavior | Endpoint |
|------|----------|----------|
| AUTO | Controlled by soil moisture threshold (40%) | `/normal` |
| FORCE ON | Manual motor ON | `/forceon` |
| FORCE OFF | Manual motor OFF | `/forceoff` |
| MANUAL | No automatic control | Manual mode flag |

### 3. Multi-User Authentication
- Username/password verification
- OTP (One-Time Password) validation
- Biometric fingerprint verification
- Session token management (24h expiry)
- Role-based permissions:
  - **Admin**: Full access (read/write/delete)
  - **Operator**: Read & write access
  - **Guest**: Read-only access

### 4. Advanced Features
- 3-attempt retry logic with backoff
- Sensor data polling every 4 seconds
- GPIO state confirmation
- CORS headers for browser access
- Exponential backoff for offline detection
- SMS alert integration
- Auto-shutoff at 75% moisture
- Comprehensive logging

## 📁 Project Structure

```
├── pages/
│   ├── SmartIrrigation.tsx           ← NEW React component
│   ├── AxisLogin.tsx                 (Existing auth)
│   └── AxisDashboard.tsx             (Existing hardware dashboard)
├── utils/
│   ├── smartIrrigationApi.ts         ← NEW API client
│   └── genai.ts                      (Existing AI)
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── Guardian3DViewer.tsx
├── context/
│   ├── LanguageContext.tsx
│   └── CartContext.tsx
├── server.js                         ← NEW API server
├── ESP32_SENSOR_CODE_ENHANCED.ino    ← NEW Arduino firmware
├── package.json                      (Updated)
├── vite.config.ts
├── SMART_IRRIGATION_SETUP.md         ← NEW documentation
├── INTEGRATION_GUIDE.md              ← NEW integration guide
├── setup-smart-irrigation.sh         ← NEW setup script
└── README.md                         (This file)
```

## 🔌 API Endpoints

### Base URL: `http://localhost:5000/api`

#### Authentication
```
POST   /auth/login              - Login with credentials
POST   /auth/otp                - Verify OTP
POST   /auth/biometric          - Verify biometric
POST   /auth/logout             - Logout
```

#### Sensors
```
GET    /hardware/sensors        - Get real-time sensor data
GET    /hardware/status         - Get system status
```

#### Motor Control
```
POST   /hardware/motor/on       - Turn motor ON
POST   /hardware/motor/off      - Turn motor OFF
POST   /hardware/motor/auto     - Set AUTO mode
POST   /hardware/motor/manual   - Set MANUAL mode
```

#### Configuration
```
GET    /hardware/config         - Get configuration
POST   /hardware/config/update  - Update configuration (Admin only)
```

#### Alerts
```
POST   /alerts/sms              - Send SMS alert
```

#### System
```
GET    /health                  - Health check
```

## 🛠️ Hardware Setup

### Components Required
- ESP32 DevKit microcontroller
- DHT11 temperature/humidity sensor
- Soil moisture sensor (capacitive or resistive)
- Relay module (5V)
- DC motor with pump
- Power supply (5V for ESP32 + motor)
- Jumper wires and breadboard

### GPIO Configuration
```
ESP32 GPIO 4   → DHT11 sensor data pin
ESP32 GPIO 34  → Soil moisture sensor analog input
ESP32 GPIO 26  → Relay module control pin
```

### Wiring Diagram
```
        ESP32
    ┌─────────────┐
    │             │
G4  ├─────────► DHT11
    │             │
34  ├─────────► Soil Sensor
    │             │
26  ├─────────► Relay IN
    │             │
GND ├─────────► Common Ground
    │
5V  ├─────────► Relay VCC
    └─────────────┘
                    │
              ┌─────┴─────┐
              │  Relay    │
              │  (NO/NC)  │
              └─────┬─────┘
                    │
                ┌───┴────┐
                │ Motor  │
                │ + Pump │
                └────────┘
```

## 📋 Configuration

### Arduino Calibration
Edit in `ESP32_SENSOR_CODE_ENHANCED.ino`:
```cpp
#define DRY_VAL  3200   // ADC value in dry soil
#define WET_VAL  1200   // ADC value in wet soil
```

### Server Configuration
Edit in `server.js`:
```javascript
const HARDWARE_IP = '10.57.97.215';  // ESP32 IP
const PORT = 5000;                   // API server port
const moistureThreshold = 2500;      // Soil moisture threshold
```

### Hardware Config Endpoint Response
```json
{
  "hardwareIp": "10.57.97.215",
  "moistureThreshold": 2500,
  "temperatureUnit": "C",
  "humidityUnit": "%",
  "pollInterval": 4000,
  "retryAttempts": 3,
  "retryDelay": 1500,
  "commandTimeout": 8000
}
```

## 📱 Response Examples

### Sensor Data Response
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

## 🔐 Security Features

- **Session Tokens**: 24-hour expiry, unique per login
- **Role-Based Access Control**: Admin/Operator/Guest permissions
- **Password Hashing**: (Implement bcrypt in production)
- **CORS Protection**: Origin validation
- **Request Validation**: Input sanitization
- **HTTPS**: Enable in production
- **API Rate Limiting**: Prevent brute force attacks

## ⚙️ Advanced Usage

### API Client Usage
```typescript
import { AuthAPI, SensorAPI, MotorAPI, SessionManager } from '@/utils/smartIrrigationApi';

// Login
const loginResponse = await AuthAPI.login('axis_admin', 'axis2025');
SessionManager.saveSession({
  token: loginResponse.data.token,
  username: loginResponse.data.user.username,
  role: loginResponse.data.user.role,
  permissions: loginResponse.data.user.permissions
});

// Get sensor data
const session = SessionManager.getSession();
const sensorData = await SensorAPI.getSensorData(session!.token);

// Control motor
await MotorAPI.turnOn(session!.token);
await MotorAPI.setAutoMode(session!.token);
```

### Create Protected Component
```typescript
import { ProtectedHardwareRoute } from '@/components/ProtectedHardwareRoute';

<Route 
  path="/smart-irrigation"
  element={
    <ProtectedHardwareRoute requiredPermission="read">
      <SmartIrrigation />
    </ProtectedHardwareRoute>
  }
/>
```

## 🧪 Testing

### Manual API Testing
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

# Control motor
curl -X POST http://localhost:5000/api/hardware/motor/on \
  -H "x-session-token: TOKEN"
```

### Hardware Testing
```bash
# Direct ESP32 endpoint
curl http://10.57.97.215/
curl http://10.57.97.215/sensor
curl http://10.57.97.215/forceon
curl http://10.57.97.215/forceoff
```

## 📚 Related Documentation

- **Setup Guide**: [`SMART_IRRIGATION_SETUP.md`](SMART_IRRIGATION_SETUP.md) - 40+ sections covering complete setup
- **Integration**: [`INTEGRATION_GUIDE.md`](INTEGRATION_GUIDE.md) - How to integrate into your React app
- **Arduino Code**: [`ESP32_SENSOR_CODE_ENHANCED.ino`](ESP32_SENSOR_CODE_ENHANCED.ino) - Full firmware with comments
- **API Client**: [`utils/smartIrrigationApi.ts`](utils/smartIrrigationApi.ts) - Complete TypeScript client

## 🚨 Troubleshooting

### Hardware Offline
```
Error: Failed to fetch sensor data
Solution: Check ESP32 WiFi, IP address, power supply
```

### Authentication Failed
```
Error: Invalid credentials
Solution: Verify credentials in server.js HARDWARE_USERS object
```

### Motor Not Responding
```
Error: Failed to turn motor ON
Solution: Check relay wiring, GPIO pin, motor power
```

### CORS Errors
```
Error: Block by CORS policy
Solution: Ensure backend is running, check CORS headers
```

## 📦 Dependencies Added

### Production
- `express` ^4.18.2 - Web framework
- `cors` ^2.8.5 - CORS middleware
- `axios` ^1.6.0 - HTTP client
- `dotenv` ^16.3.1 - Environment variables

### Development
- `@types/express` ^4.17.17 - TypeScript types
- `concurrently` ^8.2.2 - Run multiple commands
- `ts-node` ^10.9.1 - TypeScript runner

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure ESP32 WiFi credentials in Arduino code
3. ✅ Upload firmware to ESP32
4. ✅ Start backend: `npm run dev:server`
5. ✅ Start frontend: `npm run dev`
6. ✅ Login at `http://localhost:3000/axis-login`
7. ✅ Navigate to Smart Irrigation dashboard
8. ✅ Test motor controls
9. ✅ Configure SMS alerts
10. ✅ Monitor sensor data

## 📞 Support & Debugging

### Check Hardware Connection
```bash
ssh root@10.57.97.215
iwconfig              # Check WiFi
hostname -I          # Check IP
```

### View Arduino Logs
- Open Arduino IDE Serial Monitor
- Select COM port and 115200 baud rate
- Upload firmware and view debug output

### Enable Debug Logging
```javascript
// Add to server.js
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
```

## 📄 License

Proprietary - UzhavanForum Agricultural Platform

## 👨‍💻 Contributors

- **Frontend**: React component, API client
- **Backend**: Node.js API server, authentication
- **Hardware**: ESP32 firmware, GPIO control

## 🎉 Version History

- **v1.0.0** (February 28, 2026)
  - Initial release
  - Multi-factor authentication
  - Real-time sensor monitoring
  - Motor control integration
  - API documentation
  - Setup guides

---

**Ready to go!** Start with `npm run dev:all` and access the dashboard at `http://localhost:3000/smart-irrigation`

For detailed instructions, see [`SMART_IRRIGATION_SETUP.md`](SMART_IRRIGATION_SETUP.md)
