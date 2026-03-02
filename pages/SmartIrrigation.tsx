/**
 * Smart Irrigation System - React Component
 * Real-time soil moisture, temperature, humidity monitoring
 * Motor control (ON/OFF/AUTO/MANUAL modes)
 * Hardware integration with authentication
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface SensorData {
  moisture_pct: number | null;
  moisture_raw: number | null;
  temperature: number | null;
  humidity: number | null;
  pump_mode: 'normal' | 'forceon' | 'forceoff' | 'unknown';
  rssi: number | null;
  uptime_s: number | null;
  ip: string;
  timestamp: string;
}

interface UserSession {
  username: string;
  role: string;
  permissions: string[];
  token: string;
}

type ControlMode = 'AUTO' | 'MANUAL';
type MotorState = 'ON' | 'OFF' | 'UNKNOWN';

const SmartIrrigationSystem: React.FC = () => {
  const navigate = useNavigate();
  
  // User & Auth
  const [session, setSession] = useState<UserSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Sensor Data
  const [sensors, setSensors] = useState<SensorData>({
    moisture_pct: null,
    moisture_raw: null,
    temperature: null,
    humidity: null,
    pump_mode: 'unknown',
    rssi: null,
    uptime_s: null,
    ip: '10.57.97.215',
    timestamp: new Date().toISOString()
  });
  
  // Motor Control
  const [controlMode, setControlMode] = useState<ControlMode>('AUTO');
  const [motorState, setMotorState] = useState<MotorState>('UNKNOWN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [logs, setLogs] = useState<Array<{ ts: number; msg: string; type: 'info' | 'warn' | 'ok' | 'err' }>>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Helper: Add log entry
  const addLog = useCallback((message: string, type: 'info' | 'warn' | 'ok' | 'err' = 'info') => {
    setLogs(prev => [...prev, { ts: Date.now(), msg: message, type }].slice(-20));
  }, []);
  
  // Auto-scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);
  
  // Check authentication on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('axis_hw_token');
    if (storedToken) {
      try {
        const userStr = localStorage.getItem('axis_hw_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setSession({ ...user, token: storedToken });
          setIsAuthenticated(true);
          addLog('✓ Session restored', 'ok');
        }
      } catch (err) {
        addLog('Session restoration failed', 'warn');
        localStorage.removeItem('axis_hw_token');
        localStorage.removeItem('axis_hw_user');
      }
    }
  }, [addLog]);
  
  // Fetch sensor data
  const fetchSensorData = useCallback(async () => {
    if (!session?.token) return;
    
    try {
      // Try Node.js API first
      const res = await fetch('/api/hardware/sensors', {
        headers: { 'x-session-token': session.token }
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const json = await res.json();
      if (json.success && json.data) {
        setSensors({
          ...json.data,
          timestamp: json.timestamp
        });
        setError(null);
      }
    } catch (err: any) {
      // Fallback: Direct hardware proxy
      try {
        const res = await fetch('/hw/sensor');
        if (res.ok) {
          const data = await res.json();
          setSensors({
            moisture_pct: data.moisture_pct || 0,
            moisture_raw: data.moisture_raw || 0,
            temperature: data.temperature || 0,
            humidity: data.humidity || 0,
            pump_mode: data.pump_mode || 'unknown',
            rssi: data.rssi || -100,
            uptime_s: data.uptime_s || 0,
            ip: data.ip || '10.57.97.215',
            timestamp: new Date().toISOString()
          });
          setError(null);
        }
      } catch (fallbackErr) {
        addLog(`[SENSOR] Error: ${err?.message || 'Unknown'}`, 'warn');
      }
    }
  }, [session?.token, addLog]);
  
  // Poll sensors every 4 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    
    fetchSensorData(); // Immediate first fetch
    
    pollIntervalRef.current = setInterval(() => {
      fetchSensorData();
    }, 4000);
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isAuthenticated, fetchSensorData]);
  
  // Control Motor
  const controlMotor = useCallback(async (command: 'on' | 'off' | 'auto' | 'manual') => {
    if (!session?.token) {
      addLog('Not authenticated', 'err');
      return;
    }
    
    setIsLoading(true);
    addLog(`[MOTOR] → ${command.toUpperCase()}`, 'info');
    
    try {
      const endpoint = `/api/hardware/motor/${command}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'x-session-token': session.token,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const json = await res.json();
      
      if (json.success) {
        addLog(`✓ ${json.message}`, 'ok');
        
        if (command === 'on') {
          setMotorState('ON');
          setControlMode('MANUAL');
        } else if (command === 'off') {
          setMotorState('OFF');
          setControlMode('MANUAL');
        } else if (command === 'auto') {
          setControlMode('AUTO');
        } else if (command === 'manual') {
          setControlMode('MANUAL');
        }
        
        // Refresh sensor data
        setTimeout(fetchSensorData, 1000);
      } else {
        throw new Error(json.message || 'Command failed');
      }
    } catch (err: any) {
      addLog(`✗ ${err?.message || 'Command failed'}`, 'err');
      setError(err?.message || 'Failed to control motor');
    } finally {
      setIsLoading(false);
    }
  }, [session?.token, addLog, fetchSensorData]);
  
  // Logout
  const handleLogout = useCallback(async () => {
    if (session?.token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'x-session-token': session.token }
        });
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    
    localStorage.removeItem('axis_hw_token');
    localStorage.removeItem('axis_hw_user');
    setSession(null);
    setIsAuthenticated(false);
    navigate('/login');
  }, [session?.token, navigate]);
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 to-stone-800 flex items-center justify-center p-4">
        <div className="bg-stone-800 rounded-lg p-8 max-w-md w-full shadow-2xl">
          <h2 className="text-2xl font-bold text-green-400 mb-4">Hardware Required</h2>
          <p className="text-stone-400">Please login via AXIS to access the Smart Irrigation System.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  // Soil moisture visualization
  const getMoistureColor = (pct: number | null) => {
    if (pct === null) return 'bg-stone-600';
    if (pct < 30) return 'bg-red-500';
    if (pct < 50) return 'bg-orange-400';
    if (pct < 70) return 'bg-yellow-400';
    return 'bg-green-500';
  };
  
  const getMoistureLabel = (pct: number | null) => {
    if (pct === null) return 'N/A';
    if (pct < 30) return 'VERY DRY';
    if (pct < 50) return 'DRY';
    if (pct < 70) return 'MODERATE';
    return 'WET';
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center bg-stone-800 rounded-lg p-6 shadow-lg border border-stone-700">
          <div>
            <h1 className="text-3xl font-bold text-green-400">🌱 Smart Irrigation System</h1>
            <p className="text-stone-400 mt-1">Real-time Hardware Monitoring & Control</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-stone-300">User: <span className="text-green-400 font-bold">{session?.username}</span></p>
            <p className="text-sm text-stone-300">Role: <span className="text-yellow-400 font-bold">{session?.role}</span></p>
            <button
              onClick={handleLogout}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sensor Data Card */}
        <div className="lg:col-span-2 bg-stone-800 rounded-lg p-6 shadow-lg border border-stone-700">
          <h2 className="text-2xl font-bold text-green-400 mb-6">📊 Sensor Data</h2>
          
          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded text-red-200">
              ⚠️ {error}
            </div>
          )}
          
          {/* Soil Moisture */}
          <div className="mb-6">
            <label className="text-stone-300 text-sm font-semibold mb-2 block">🌍 Soil Moisture</label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="bg-stone-700 rounded-full h-8 overflow-hidden">
                  <div
                    className={`h-full ${getMoistureColor(sensors.moisture_pct)} transition-all duration-500`}
                    style={{ width: `${Math.min(sensors.moisture_pct ?? 0, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-right min-w-fit">
                <p className="text-2xl font-bold text-green-400">{sensors.moisture_pct ?? '?'}%</p>
                <p className="text-xs text-stone-400">{getMoistureLabel(sensors.moisture_pct)}</p>
              </div>
            </div>
            <p className="text-xs text-stone-500 mt-1">Raw: {sensors.moisture_raw ?? 'N/A'}</p>
          </div>
          
          {/* Temperature & Humidity */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-stone-300 text-xs font-semibold mb-2 block">🌡️ Temperature</label>
              <div className="bg-stone-700 rounded p-3 text-center">
                <p className="text-xl font-bold text-blue-400">{sensors.temperature ?? 'N/A'}°C</p>
              </div>
            </div>
            <div>
              <label className="text-stone-300 text-xs font-semibold mb-2 block">💧 Humidity</label>
              <div className="bg-stone-700 rounded p-3 text-center">
                <p className="text-xl font-bold text-cyan-400">{sensors.humidity ?? 'N/A'}%</p>
              </div>
            </div>
          </div>
          
          {/* System Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-stone-300 text-xs font-semibold mb-2 block">📡 WiFi Signal</label>
              <div className="bg-stone-700 rounded p-3 text-center">
                <p className="text-lg font-bold text-purple-400">{sensors.rssi ?? 'N/A'} dBm</p>
              </div>
            </div>
            <div>
              <label className="text-stone-300 text-xs font-semibold mb-2 block">⏱️ Uptime</label>
              <div className="bg-stone-700 rounded p-3 text-center">
                <p className="text-lg font-bold text-orange-400">
                  {sensors.uptime_s ? `${Math.floor((sensors.uptime_s || 0) / 60)}m` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Motor Control Card */}
        <div className="bg-stone-800 rounded-lg p-6 shadow-lg border border-stone-700">
          <h2 className="text-2xl font-bold text-green-400 mb-6">🔌 Motor Control</h2>
          
          {/* Mode Indicator */}
          <div className="mb-6 p-4 bg-stone-700 rounded border border-stone-600">
            <p className="text-xs text-stone-400 mb-1">Current Mode</p>
            <p className="text-xl font-bold text-yellow-400">{controlMode}</p>
          </div>
          
          {/* Motor Status */}
          <div className="mb-6 p-4 bg-stone-700 rounded border border-stone-600">
            <p className="text-xs text-stone-400 mb-1">Motor Status</p>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${motorState === 'ON' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <p className="text-xl font-bold">{motorState}</p>
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => controlMotor('on')}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-stone-600 text-white font-bold py-3 rounded transition"
            >
              💚 Motor ON
            </button>
            
            <button
              onClick={() => controlMotor('off')}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-stone-600 text-white font-bold py-3 rounded transition"
            >
              ❌ Motor OFF
            </button>
            
            <button
              onClick={() => controlMotor('auto')}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-stone-600 text-white font-bold py-3 rounded transition"
            >
              🤖 AUTO Mode
            </button>
            
            <button
              onClick={() => controlMotor('manual')}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-stone-600 text-white font-bold py-3 rounded transition"
            >
              👤 MANUAL Mode
            </button>
          </div>
          
          {isLoading && (
            <div className="mt-4 text-center">
              <p className="text-sm text-stone-400 animate-pulse">Processing...</p>
            </div>
          )}
        </div>
      </div>
      
      {/* System Logs */}
      <div className="max-w-6xl mx-auto mt-6 bg-stone-800 rounded-lg p-6 shadow-lg border border-stone-700">
        <h2 className="text-2xl font-bold text-green-400 mb-4">📋 System Logs</h2>
        <div className="bg-stone-900 rounded p-4 h-40 overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-stone-500">No logs yet...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className={`py-1 ${
                log.type === 'ok' ? 'text-green-400' :
                log.type === 'err' ? 'text-red-400' :
                log.type === 'warn' ? 'text-yellow-400' :
                'text-stone-400'
              }`}>
                <span className="text-stone-600">[{new Date(log.ts).toLocaleTimeString()}]</span> {log.msg}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
      
      {/* Hardware Info Footer */}
      <div className="max-w-6xl mx-auto mt-6 text-center">
        <p className="text-stone-500 text-sm">
          Hardware IP: {sensors.ip} | Last Update: {new Date(sensors.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default SmartIrrigationSystem;
