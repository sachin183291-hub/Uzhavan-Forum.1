🌱 SMART IRRIGATION SYSTEM - VISUAL SYSTEM ARCHITECTURE
═══════════════════════════════════════════════════════════════════════════════

COMPLETE SYSTEM OVERVIEW
═══════════════════════════════════════════════════════════════════════════════

                          FARMER/USER
                              │
                              ▼
                    ┌──────────────────┐
                    │  Web Browser     │
                    │  localhost:3000  │
                    └────────┬─────────┘
                             │
                    ┌────────▼────────┐
                    │ React Frontend  │
                    │ pages/          │
                    │ SmartIrrigation │
                    │    .tsx         │
                    └────────┬────────┘
                             │ HTTP/REST
                             │ (JSON)
                             ▼
                    ┌────────────────────────┐
                    │  Node.js Express API   │
                    │  server.js             │
                    │  Port: 5000            │
                    │  ┌──────────────────┐  │
                    │  │ /api/auth/login  │  │
                    │  │ /api/sensors     │  │
                    │  │ /api/motor/*     │  │
                    │  │ /api/config      │  │
                    │  │ /api/alerts      │  │
                    │  └──────────────────┘  │
                    └────────┬───────────────┘
                             │ HTTP
                             │ TCP/IP over WiFi
                             ▼
                    ┌────────────────────────┐
                    │  ESP32 Microcontroller │
                    │  10.57.97.215          │
                    │  ┌──────────────────┐  │
                    │  │ WiFi Module      │  │
                    │  │ HTTP Server      │  │
                    │  │ (Port 80)        │  │
                    │  └──────────────────┘  │
                    │  ┌──────────────────┐  │
                    │  │ Sensors:         │  │
                    │  │ • DHT11 (GPIO 4) │  │
                    │  │ • Soil (GPIO 34) │  │
                    │  │ • Relay (GPIO 26)│  │
                    │  └──────────────────┘  │
                    │  ┌──────────────────┐  │
                    │  │ HTTP Handlers:   │  │
                    │  │ GET /            │  │
                    │  │ GET /sensor      │  │
                    │  │ GET /forceon     │  │
                    │  │ GET /forceoff    │  │
                    │  │ GET /normal      │  │
                    │  └──────────────────┘  │
                    └────────┬───────────────┘
                             │ GPIO/Power
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
    ┌────────┐          ┌────────┐          ┌────────┐
    │ DHT11  │          │ Relay  │          │ Soil   │
    │ Temp   │          │ Module │          │ Sensor │
    │ Humid. │          └────┬───┘          │        │
    └────────┘               │              └────────┘
                             │
                             ▼
                        ┌────────┐
                        │ DC     │
                        │ Motor  │
                        │ Pump   │
                        └────────┘


DATA FLOW DIAGRAM
═══════════════════════════════════════════════════════════════════════════════

REAL-TIME MONITORING
                    ┌──────────────────────┐
                    │ SmartIrrigation.tsx  │
                    │ (React Component)    │
                    └──────────┬───────────┘
                               │ Every 4 seconds
                               ▼
                    ┌──────────────────────┐
                    │  API: GET /sensors   │
                    │  (Token required)    │
                    └──────────┬───────────┘
                               │ Proxies to
                               ▼
                    ┌──────────────────────┐
                    │  ESP32: GET /sensor  │
                    │  Returns JSON data   │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │ Sensor Data:         │
                    │ • moisture_pct       │
                    │ • temperature        │
                    │ • humidity           │
                    │ • rssi               │
                    │ • uptime_s           │
                    │ • pump_mode          │
                    └──────────────────────┘


MOTOR CONTROL FLOW
                    ┌──────────────────────┐
                    │ User clicks button   │
                    │ (ON/OFF/AUTO/MANUAL) │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ JavaScript onClick   │
                    │ handler in React     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Fetch API endpoint   │
                    │ (/api/motor/*)       │
                    │ With Session Token   │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │ Retry Logic (3x)     │
                    │ 1.5s delays          │
                    │ 8s timeout           │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ ESP32: GPIO 26      │
                    │ digitalWrite(LOW)    │
                    │  OR                  │
                    │ digitalWrite(HIGH)   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Relay Module         │
                    │ Activates/Deactivates│
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ DC Motor             │
                    │ Pumps water ON/OFF   │
                    └──────────────────────┘


AUTHENTICATION FLOW
═══════════════════════════════════════════════════════════════════════════════

Step 1: Login with Credentials
┌─────────────────────────────────────────────────┐
│ Username: axis_admin                            │
│ Password: axis2025                              │
│                                                 │
└──────────┬──────────────────────────────────────┘
           │
           ▼
      POST /api/auth/login
      {username, password}
           │
           ▼
    ┌─────────────────────────┐
    │ Verify credentials in   │
    │ HARDWARE_USERS          │
    │ Generate session token  │
    │                         │
    │ Response: {token, user} │
    └──────────┬──────────────┘
               │
               ▼
    ┌─────────────────────────┐
    │ Store token in:         │
    │ localStorage            │
    │ axis_hw_token           │
    └─────────────────────────┘

Step 2: OTP Verification (Optional)
    ┌─────────────────────────┐
    │ OTP: 123456 (test)      │
    └──────────┬──────────────┘
               │
               ▼
      POST /api/auth/otp
      {token, otp}
               │
               ▼
    ┌─────────────────────────┐
    │ Verify OTP              │
    │ Set:                    │
    │ session.otpVerified=true│
    └─────────────────────────┘

Step 3: Biometric Verification (Optional)
    ┌─────────────────────────┐
    │ Fingerprint scan        │
    └──────────┬──────────────┘
               │
               ▼
      POST /api/auth/biometric
      {token, biometric}
               │
               ▼
    ┌─────────────────────────┐
    │ Verify biometric        │
    │ Set:                    │
    │ session.biometricVer=true
    │ session.fullyAuth=true  │
    └────────┬────────────────┘
             │
             ▼
    ✅ FULLY AUTHENTICATED
    Access SmartIrrigation dashboard


USER ROLES & PERMISSIONS
═══════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────┐
│ ADMIN (axis_admin / axis2025)                                    │
├──────────────────────────────────────────────────────────────────┤
│ Permissions: ['read', 'write', 'delete']                         │
│ Can:                                                              │
│ ✓ View all sensor data                                           │
│ ✓ Control motors (ON/OFF/AUTO)                                   │
│ ✓ Update hardware configuration                                  │
│ ✓ Manage user settings                                           │
│ ✓ Send SMS alerts                                                │
│ ✓ View system logs                                               │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ OPERATOR (axis_op / op@2025)                                     │
├──────────────────────────────────────────────────────────────────┤
│ Permissions: ['read', 'write']                                   │
│ Can:                                                              │
│ ✓ View all sensor data                                           │
│ ✓ Control motors (ON/OFF/AUTO)                                   │
│ ✗ NOT modify configuration                                       │
│ ✓ Send SMS alerts                                                │
│ ✓ View system logs                                               │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ GUEST (axis_guest / guest123)                                    │
├──────────────────────────────────────────────────────────────────┤
│ Permissions: ['read']                                            │
│ Can:                                                              │
│ ✓ View all sensor data                                           │
│ ✓ View motor status                                              │
│ ✗ NOT control motors                                             │
│ ✗ NOT modify configuration                                       │
│ ✗ NOT send alerts                                                │
└──────────────────────────────────────────────────────────────────┘


FILE DEPENDENCY TREE
═══════════════════════════════════════════════════════════════════════════════

App Router (index.tsx or App.tsx)
│
├─ AxisLogin.tsx (Existing)
│
├─ AxisDashboard.tsx (Existing)
│
└─ SmartIrrigation.tsx (NEW) ◄─── Primary Component
   │
   ├─ Import: useNavigate, useCallback, useEffect, useState
   │
   ├─ Import: smartIrrigationApi.ts ◄─── API Client
   │  │
   │  ├─ AuthAPI.login()
   │  ├─ SensorAPI.getSensorData()
   │  ├─ MotorAPI.turnOn/Off/setAutoMode()
   │  └─ SessionManager.getSession()
   │
   └─ Uses: localStorage ◄─── Session storage
      └─ axis_hw_token
      └─ axis_hw_user


Backend Server Hierarchy
═══════════════════════════════════════════════════════════════════════════════

server.js (Express App)
│
├─ Middleware
│  ├─ cors()
│  └─ express.json()
│
├─ Authentication Routes
│  ├─ POST /api/auth/login
│  ├─ POST /api/auth/otp
│  ├─ POST /api/auth/biometric
│  └─ POST /api/auth/logout
│
├─ Protected Routes (require session token)
│  │
│  ├─ GET /api/hardware/sensors ──► Proxies to ──► ESP32 /sensor
│  ├─ GET /api/hardware/status  ──► Proxies to ──► ESP32 /
│  │
│  ├─ POST /api/hardware/motor/on
│  │  └─ Fetch ESP32 /forceon (3x retry)
│  │
│  ├─ POST /api/hardware/motor/off
│  │  └─ Fetch ESP32 /forceoff (3x retry)
│  │
│  ├─ POST /api/hardware/motor/auto
│  │  └─ Fetch ESP32 /normal
│  │
│  └─ POST /api/hardware/motor/manual
│
├─ Config Routes
│  ├─ GET /api/hardware/config
│  └─ POST /api/hardware/config/update
│
├─ Alert Routes
│  └─ POST /api/alerts/sms
│
└─ System Routes
   └─ GET /api/health


Sensor Monitoring Loop
═══════════════════════════════════════════════════════════════════════════════

SmartIrrigation.tsx
│
└─ useEffect (on mount)
   │
   └─ setInterval(fetchSensorData, 4000)
      │
      ├─ Every 4 seconds
      │
      ├─ Fetch /api/hardware/sensors
      │  │
      │  └─ Sets setSensors() state
      │
      ├─ Component re-renders
      │
      └─ UI updates with new data
         │
         ├─ Moisture bar updates
         ├─ Temperature/Humidity updates
         ├─ WiFi signal updates
         └─ Uptime counter updates


Motor Control State Machine
═══════════════════════════════════════════════════════════════════════════════

┌─────────┐
│ UNKNOWN │ ◄─── Initial state
└────┬────┘
     │
     ├─ User clicks "Motor ON"
     │  │
     │  ▼
     │  Fetch /api/hardware/motor/on
     │  │
     │  ▼
     └─────► ┌───┐
             │ ON│ ◄─── Motor Running
             └──┬┘
                │
                ├─ User clicks "Motor OFF"
                │  │
                │  ▼
                │  Fetch /api/hardware/motor/off
                │  │
                │  ▼
                └────► ┌─────┐
                       │ OFF │ ◄─── Motor Stopped
                       └──┬──┘
                          │
                          └─ Cycle continues


═══════════════════════════════════════════════════════════════════════════════

🚀 EXECUTION FLOW SUMMARY

1. User opens http://localhost:3000/smart-irrigation
2. React component checks authentication (localStorage)
3. If not logged in, redirects to /axis-login
4. After login, session token saved
5. SmartIrrigation component mounts
6. useEffect starts 4-second polling loop
7. fetchSensorData() calls /api/hardware/sensors
8. Backend validates token and proxies to ESP32 /sensor
9. ESP32 reads DHT11 and ADC sensors
10. Returns JSON data to frontend
11. Component updates UI with new values
12. User can click motor control buttons
13. onClick calls controlMotor() with command
14. Fetch /api/hardware/motor/{command}
15. Backend retries 3x with 1.5s delays
16. ESP32 GPIO is toggled (HIGH/LOW)
17. Relay activates/deactivates
18. Motor starts/stops
19. Response returned with confirmation
20. UI updates motor status
21. SMS alert may be triggered
22. Logs displayed in system logs area
23. Polling continues in background
24. User can logout anytime
25. Session cleared, redirects to login

═══════════════════════════════════════════════════════════════════════════════

Last Updated: February 28, 2026
System Status: ✅ Complete and Ready
