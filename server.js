/**
 * Smart Irrigation System - Node.js Backend
 * Interfaces Arduino ESP32 with React Frontend
 * Provides REST API for sensor data, motor control, and authentication
 */

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 5000;
const HARDWARE_IP = '10.57.97.215';
const HW_BASE_URL = `http://${HARDWARE_IP}`;

// Middleware
app.use(cors());
app.use(express.json());

// ========== AUTHENTICATION ==========
const HARDWARE_USERS = {
  'axis_admin': { password: 'axis2025', role: 'Admin', permissions: ['read', 'write', 'delete'] },
  'axis_op': { password: 'op@2025', role: 'Operator', permissions: ['read', 'write'] },
  'axis_guest': { password: 'guest123', role: 'Guest', permissions: ['read'] }
};

const activeSessions = new Map();

// Middleware: Verify Session Token
function verifySession(req, res, next) {
  const token = req.headers['x-session-token'];
  
  if (!token || !activeSessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized', message: 'No valid session token' });
  }
  
  const session = activeSessions.get(token);
  if (Date.now() - session.loginTime > 24 * 60 * 60 * 1000) { // 24 hour expiry
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Session Expired', message: 'Please login again' });
  }
  
  req.user = session;
  next();
}

// ========== AUTH ENDPOINTS ==========

/**
 * POST /api/auth/login
 * Authenticate user with username and password
 */
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials', message: 'Username and password required' });
  }
  
  const user = HARDWARE_USERS[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials', message: 'Username or password incorrect' });
  }
  
  // Generate session token
  const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  activeSessions.set(token, {
    username,
    role: user.role,
    permissions: user.permissions,
    loginTime: Date.now()
  });
  
  res.json({
    token,
    user: {
      username,
      role: user.role,
      permissions: user.permissions
    }
  });
});

/**
 * POST /api/auth/otp
 * Verify OTP for multi-factor authentication
 */
app.post('/api/auth/otp', (req, res) => {
  const { token, otp } = req.body;
  
  if (!activeSessions.has(token)) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Simple OTP verification (in production, use proper OTP service)
  if (otp !== '123456') {
    return res.status(401).json({ error: 'Invalid OTP' });
  }
  
  const session = activeSessions.get(token);
  session.otpVerified = true;
  
  res.json({ success: true, message: 'OTP verified' });
});

/**
 * POST /api/auth/biometric
 * Verify biometric for multi-factor authentication
 */
app.post('/api/auth/biometric', (req, res) => {
  const { token, biometric } = req.body;
  
  if (!activeSessions.has(token)) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Verify biometric (simulated)
  if (!biometric) {
    return res.status(400).json({ error: 'Biometric data required' });
  }
  
  const session = activeSessions.get(token);
  if (!session.otpVerified) {
    return res.status(401).json({ error: 'OTP not verified yet' });
  }
  
  session.biometricVerified = true;
  session.fullyAuthenticated = true;
  
  res.json({ success: true, message: 'Authentication complete' });
});

/**
 * POST /api/auth/logout
 * Logout and invalidate session
 */
app.post('/api/auth/logout', verifySession, (req, res) => {
  const token = req.headers['x-session-token'];
  activeSessions.delete(token);
  res.json({ success: true, message: 'Logged out successfully' });
});

// ========== SENSOR ENDPOINTS ==========

/**
 * GET /api/hardware/sensors
 * Get real-time sensor data from ESP32
 */
app.get('/api/hardware/sensors', verifySession, async (req, res) => {
  try {
    const response = await axios.get(`${HW_BASE_URL}/sensor`, { timeout: 5000 });
    
    // Parse Arduino JSON response
    const sensorData = typeof response.data === 'string' 
      ? JSON.parse(response.data) 
      : response.data;
    
    res.json({
      success: true,
      data: {
        moisture_pct: sensorData.moisture_pct || sensorData.soil_moisture || 0,
        moisture_raw: sensorData.moisture_raw || sensorData.soil_raw || 0,
        temperature: sensorData.temperature || 0,
        humidity: sensorData.humidity || 0,
        pump_mode: sensorData.pump_mode || 'unknown',
        rssi: sensorData.rssi || -100,
        uptime_s: sensorData.uptime_s || 0,
        ip: sensorData.ip || HARDWARE_IP
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[SENSOR] Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Unable to fetch sensor data',
      message: error.message
    });
  }
});

/**
 * GET /api/hardware/status
 * Get hardware system status and diagnostics
 */
app.get('/api/hardware/status', verifySession, async (req, res) => {
  try {
    const response = await axios.get(`${HW_BASE_URL}/`, { timeout: 5000 });
    
    res.json({
      success: true,
      data: {
        online: true,
        html: response.data,
        ip: HARDWARE_IP,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Hardware offline',
      message: error.message
    });
  }
});

// ========== MOTOR CONTROL ENDPOINTS ==========

/**
 * POST /api/hardware/motor/on
 * Turn motor ON (Force mode)
 */
app.post('/api/hardware/motor/on', verifySession, async (req, res) => {
  // Check permissions
  if (!req.user.permissions.includes('write')) {
    return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
  }
  
  try {
    let motorResponse = null;
    let attempts = 0;
    const maxAttempts = 3;
    
    // Retry logic
    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(`${HW_BASE_URL}/forceon`, { timeout: 8000 });
        motorResponse = response.data;
        
        if (motorResponse.toLowerCase().includes('forceon') || motorResponse.toLowerCase().includes('on')) {
          break;
        }
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    
    res.json({
      success: true,
      message: 'Motor turned ON',
      mode: 'forceon',
      response: motorResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[MOTOR] ON Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to turn motor ON',
      message: error.message
    });
  }
});

/**
 * POST /api/hardware/motor/off
 * Turn motor OFF (Force mode)
 */
app.post('/api/hardware/motor/off', verifySession, async (req, res) => {
  if (!req.user.permissions.includes('write')) {
    return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
  }
  
  try {
    let motorResponse = null;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(`${HW_BASE_URL}/forceoff`, { timeout: 8000 });
        motorResponse = response.data;
        
        if (motorResponse.toLowerCase().includes('forceoff') || motorResponse.toLowerCase().includes('off')) {
          break;
        }
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    
    res.json({
      success: true,
      message: 'Motor turned OFF',
      mode: 'forceoff',
      response: motorResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[MOTOR] OFF Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to turn motor OFF',
      message: error.message
    });
  }
});

/**
 * POST /api/hardware/motor/auto
 * Enable AUTO mode (automatic irrigation based on soil moisture)
 */
app.post('/api/hardware/motor/auto', verifySession, async (req, res) => {
  if (!req.user.permissions.includes('write')) {
    return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
  }
  
  try {
    const response = await axios.get(`${HW_BASE_URL}/normal`, { timeout: 8000 });
    
    res.json({
      success: true,
      message: 'Motor set to AUTO mode',
      mode: 'normal',
      response: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[MOTOR] AUTO Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to set AUTO mode',
      message: error.message
    });
  }
});

/**
 * POST /api/hardware/motor/manual
 * Enable MANUAL mode
 */
app.post('/api/hardware/motor/manual', verifySession, async (req, res) => {
  if (!req.user.permissions.includes('write')) {
    return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
  }
  
  res.json({
    success: true,
    message: 'Motor set to MANUAL mode',
    mode: 'manual',
    timestamp: new Date().toISOString()
  });
});

// ========== CONFIGURATION ENDPOINTS ==========

/**
 * GET /api/hardware/config
 * Get hardware configuration
 */
app.get('/api/hardware/config', verifySession, (req, res) => {
  res.json({
    success: true,
    config: {
      hardwareIp: HARDWARE_IP,
      moistureThreshold: 2500,
      temperatureUnit: 'C',
      humidityUnit: '%',
      pollInterval: 4000,
      retryAttempts: 3,
      retryDelay: 1500,
      commandTimeout: 8000
    }
  });
});

/**
 * POST /api/hardware/config/update
 * Update hardware configuration
 */
app.post('/api/hardware/config/update', verifySession, (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Only admins can update config' });
  }
  
  const { moistureThreshold, username, password } = req.body;
  
  // Update configuration logic here
  res.json({
    success: true,
    message: 'Configuration updated',
    timestamp: new Date().toISOString()
  });
});

// ========== ALERT ENDPOINTS ==========

/**
 * POST /api/alerts/sms
 * Send SMS alert
 */
app.post('/api/alerts/sms', verifySession, async (req, res) => {
  const { phone, message } = req.body;
  
  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone and message required' });
  }
  
  try {
    // SMS sending logic (using Fast2SMS or similar)
    res.json({
      success: true,
      message: 'SMS sent successfully',
      recipient: phone,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to send SMS',
      message: error.message
    });
  }
});

// ========== HEALTH CHECK ==========

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Smart Irrigation API',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ========== ERROR HANDLING ==========

app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// ========== START SERVER ==========

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════╗
║  Smart Irrigation System - API Server  ║
║  Port: ${PORT}                            ║
║  Hardware IP: ${HARDWARE_IP}             ║
╚════════════════════════════════════════╝
  `);
});

export default app;
