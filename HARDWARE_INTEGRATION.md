# Hardware Integration Guide

This document explains how to use the Smart Irrigation System hardware integration with your web application.

## Hardware Setup

The ESP32 microcontroller runs a web server at `10.57.97.215:80` that provides:

- **Soil Moisture Sensor** (GPIO 34): Monitors soil wetness
- **Temperature/Humidity Sensor** (GPIO 4): DHT11 sensor
- **Relay Control** (GPIO 26): Controls irrigation motor
- **WiFi Connectivity**: Connected to network for remote access

### Equipment Used

```
ESP32 Microcontroller
├─ Soil Moisture Sensor (Analog)
├─ DHT11 Temperature/Humidity Sensor
├─ Relay Module (Motor Control)
└─ WiFi Module
```

## Web Application Pages

### 1. **Hardware Control Page** (`/hardwarecontrol`)

Direct control interface for the irrigation system.

**Features:**
- Real-time sensor data (moisture, temperature, humidity)
- Motor status indicator
- Three control modes:
  - **Auto Mode**: Automatically turns motor ON when soil is DRY
  - **Force ON**: Forces motor to stay ON
  - **Force OFF**: Forces motor to stay OFF
- Live status updates (3-second refresh)
- Color-coded status indicators

**Access:**
```
URL: http://localhost:3000/#/hardwarecontrol
Requires: Login (Farmer or Officer)
```

### 2. **Hardware Dashboard** (`/hardwaredashboard`)

Comprehensive monitoring dashboard with analytics.

**Features:**
- Real-time sensor readings with progress bars
- Soil health status
- Motor status with uptime
- System health indicator
- Data point tracking (up to 60 readings)
- Historical statistics (average temperature, humidity, moisture)
- Quick control buttons
- Auto-refresh capability

**Access:**
```
URL: http://localhost:3000/#/hardwaredashboard
Requires: Login (Farmer or Officer)
```

## API Endpoints

The ESP32 exposes the following HTTP endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Returns JSON-formatted HTML with all sensor data |
| `/normal` | GET | Sets mode to AUTO (soil-based control) |
| `/forceon` | GET | Forces motor ON |
| `/forceoff` | GET | Forces motor OFF |

### Response Format

The root endpoint (`/`) returns HTML with embedded data:
```html
<div class='card'>
  Moisture Raw: 2145<br>
  Soil: <b>WET</b><br>
  Mode: <b>AUTO</b>
</div>
<div class='card'>
  Temperature: 28 C<br>
  Humidity: 65 %
</div>
<div class='card'>
  Motor: <b>ON</b>
</div>
```

## Data Structure

### Hardware Data Object
```typescript
interface HardwareData {
  moisture: number;        // ADC value (0-4095)
  soilCondition: 'WET' | 'DRY';
  temperature: number;     // Celsius
  humidity: number;        // Percentage
  motorState: boolean;     // ON/OFF
  mode: 'AUTO' | 'FORCE ON' | 'FORCE OFF';
}
```

### Sensor Reading (Historical)
```typescript
interface SensorReading {
  timestamp: number;
  moisture: number;
  temperature: number;
  humidity: number;
}
```

## Configuration

### Hardware IP Address
- **Current:** `10.57.97.215`
- **Port:** `80`
- **Update in files:**
  - `pages/HardwareControl.tsx` (line 7)
  - `pages/HardwareDashboard.tsx` (line 6)

### WiFi Network
- **SSID:** `sachin`
- **Password:** `sachin123`
- **Update in ESP32 code:**
  - `ESP32_SENSOR_CODE.ino` (lines 4-5)

## Sensor Calibration

### Moisture Sensor
- **Threshold:** 2000 (configurable)
- **Below 2000:** Soil is WET
- **Above 2000:** Soil is DRY
- **Range:** 0-4095 (ADC)

### Temperature/Humidity
- **Sensor:** DHT11
- **Update:** Every 3 seconds
- **Range:** 0-50°C, 0-100%

## Control Modes Explained

### AUTO Mode
- Reads soil moisture continuously
- If moisture > 2000 (DRY): Motor turns ON
- If moisture < 2000 (WET): Motor turns OFF
- Best for automatic irrigation

### FORCE ON
- Motor stays ON regardless of soil condition
- Override mode for manual watering
- Useful for testing or emergency irrigation

### FORCE OFF
- Motor stays OFF regardless of soil condition
- Override mode to prevent watering
- Useful for maintenance or pausing system

## Usage Workflow

1. **Login** to the application
   - Navigate to `/login`
   - Use Farmer or Officer credentials

2. **Access Hardware Control**
   - Click on Hardware Control page
   - View current sensor readings
   - Choose control mode

3. **Monitor Dashboard**
   - Check real-time data with charts
   - View system health
   - Access historical statistics

4. **Set Control Mode**
   - AUTO: Let system manage watering
   - FORCE ON: Manual watering
   - FORCE OFF: Pause watering

## Security Notes

- Hardware IP is hardcoded in source (update before production)
- No authentication on ESP32 (add API key if needed)
- CORS requests from web to hardware
- Update WiFi credentials before deploying

## Troubleshooting

### Hardware Not Connecting
- Check if ESP32 is powered on
- Verify IP address: `10.57.97.215`
- Ensure ESP32 is on same network
- Check WiFi credentials in ESP32 code

### Sensor Data Not Updating
- Verify sensor connections on ESP32
- Check DHT11 pin (GPIO 4)
- Verify soil sensor pin (GPIO 34)
- Review ESP32 serial output

### Motor Not Responding
- Check relay GPIO connection (GPIO 26)
- Verify relay logic (LOW = ON, HIGH = OFF)
- Test motor independently
- Check power supply

## Future Enhancements

- [ ] Historical data storage (database)
- [ ] Data visualization with charts
- [ ] Mobile app interface
- [ ] Push notifications
- [ ] Weather-based optimization
- [ ] Multiple device support
- [ ] Local server fallback
- [ ] OTA firmware updates
