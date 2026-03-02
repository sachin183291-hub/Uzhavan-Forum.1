import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HARDWARE_IP = '10.57.97.215';
const HARDWARE_PORT = 80;

interface HardwareData {
  moisture: number;
  soilCondition: 'WET' | 'DRY';
  temperature: number;
  humidity: number;
  motorState: boolean;
  mode: 'AUTO' | 'FORCE ON' | 'FORCE OFF';
}

interface DebugLog {
  timestamp: string;
  action: string;
  status: 'success' | 'error' | 'pending';
  message: string;
}

const HardwareControl: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<HardwareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  const addDebugLog = (action: string, status: 'success' | 'error' | 'pending', message: string) => {
    const log: DebugLog = {
      timestamp: new Date().toLocaleTimeString(),
      action,
      status,
      message
    };
    setDebugLogs(prev => [log, ...prev.slice(0, 19)]);
    console.log(`[${action}] ${status.toUpperCase()}: ${message}`);
  };

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('userRole');
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchHardwareData();
    const interval = setInterval(fetchHardwareData, 3000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchHardwareData = async () => {
    try {
      const url = `http://${HARDWARE_IP}:${HARDWARE_PORT}/`;
      addDebugLog('FETCH_DATA', 'pending', `Fetching from ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      const data = parseHardwareData(html);
      setData(data);
      setError('');
      addDebugLog('FETCH_DATA', 'success', `Data received - Motor: ${data.motorState ? 'ON' : 'OFF'}, Moisture: ${data.moisture}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Connection error: ${errorMsg}`);
      addDebugLog('FETCH_DATA', 'error', errorMsg);
      setLoading(false);
    }
    setLoading(false);
  };

  const parseHardwareData = (html: string): HardwareData => {
    const moistureMatch = html.match(/Moisture Raw: (\d+)/);
    const soilMatch = html.match(/Soil: <b>(WET|DRY)<\/b>/);
    const tempMatch = html.match(/Temperature: (\d+) C/);
    const humidityMatch = html.match(/Humidity: (\d+) %/);
    const motorMatch = html.match(/Motor: <b>(ON|OFF)<\/b>/);
    const modeMatch = html.match(/Mode: <b>(AUTO|FORCE ON|FORCE OFF)<\/b>/);

    return {
      moisture: moistureMatch ? parseInt(moistureMatch[1]) : 0,
      soilCondition: (soilMatch ? soilMatch[1] : 'DRY') as 'WET' | 'DRY',
      temperature: tempMatch ? parseInt(tempMatch[1]) : 0,
      humidity: humidityMatch ? parseInt(humidityMatch[1]) : 0,
      motorState: motorMatch ? motorMatch[1] === 'ON' : false,
      mode: (modeMatch ? modeMatch[1] : 'AUTO') as 'AUTO' | 'FORCE ON' | 'FORCE OFF',
    };
  };

  const handleControl = async (action: 'normal' | 'forceon' | 'forceoff') => {
    setActionLoading(true);
    const actionLabel = action === 'normal' ? 'AUTO' : action === 'forceon' ? 'FORCE ON' : 'FORCE OFF';
    
    try {
      const url = `http://${HARDWARE_IP}:${HARDWARE_PORT}/${action}`;
      addDebugLog(`ACTION_${action.toUpperCase()}`, 'pending', `Sending ${actionLabel} command to ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      addDebugLog(`ACTION_${action.toUpperCase()}`, 'success', `Command sent successfully (${response.status} ${response.statusText})`);
      
      // Wait a moment for hardware to process
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchHardwareData();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Action failed: ${errorMsg}`);
      addDebugLog(`ACTION_${action.toUpperCase()}`, 'error', errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-stone-900 dark:to-stone-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 px-4 py-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition"
          >
            ← Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-stone-900 dark:text-white mb-2 tracking-tight">
                Smart Irrigation Control
              </h1>
              <p className="text-stone-600 dark:text-stone-400 font-medium">
                Hardware IP: {HARDWARE_IP} | Status: {error ? '❌ Offline' : '✅ Online'}
              </p>
            </div>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="px-4 py-2 text-xs font-bold bg-stone-200 dark:bg-stone-700 rounded-lg hover:bg-stone-300 dark:hover:bg-stone-600 transition"
            >
              {showDebug ? '🔒 Hide' : '🔓 Debug'}
            </button>
          </div>
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div className="mb-6 p-4 bg-stone-100 dark:bg-stone-700 rounded-lg border border-stone-300 dark:border-stone-600 font-mono text-xs max-h-48 overflow-y-auto">
            <p className="font-bold mb-2 text-stone-900 dark:text-white">Debug Logs ({debugLogs.length})</p>
            {debugLogs.length === 0 ? (
              <p className="text-stone-600 dark:text-stone-400">No logs yet...</p>
            ) : (
              <div className="space-y-1">
                {debugLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-stone-600 dark:text-stone-400 w-12 flex-shrink-0">{log.timestamp}</span>
                    <span className={`font-bold w-32 flex-shrink-0 ${
                      log.status === 'success' ? 'text-green-600' :
                      log.status === 'error' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {log.status.toUpperCase()}
                    </span>
                    <span className="text-stone-700 dark:text-stone-300">{log.action}</span>
                    <span className="text-stone-600 dark:text-stone-400">- {log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {loading || !data ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
            <p className="mt-4 text-stone-600 dark:text-stone-400 font-medium">Loading hardware data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sensors Section */}
            <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-8 border border-stone-200 dark:border-stone-700">
              <h2 className="text-2xl font-black text-stone-900 dark:text-white mb-6 flex items-center gap-2">
                <i className="fas fa-microchip text-emerald-600" />
                Sensor Data
              </h2>

              <div className="space-y-4">
                {/* Soil Moisture */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                      <i className="fas fa-droplet mr-2 text-blue-600" />
                      Soil Moisture
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${
                      data.soilCondition === 'WET' 
                        ? 'bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-100' 
                        : 'bg-orange-200 text-orange-800 dark:bg-orange-700 dark:text-orange-100'
                    }`}>
                      {data.soilCondition}
                    </span>
                  </div>
                  <p className="text-3xl font-black text-blue-700 dark:text-blue-300">{data.moisture}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Raw ADC value (0-4095)</p>
                </div>

                {/* Temperature */}
                <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-200 dark:border-red-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                      <i className="fas fa-thermometer-half mr-2 text-red-600" />
                      Temperature
                    </span>
                  </div>
                  <p className="text-3xl font-black text-red-700 dark:text-red-300">{data.temperature}°C</p>
                </div>

                {/* Humidity */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                      <i className="fas fa-wind mr-2 text-purple-600" />
                      Humidity
                    </span>
                  </div>
                  <p className="text-3xl font-black text-purple-700 dark:text-purple-300">{data.humidity}%</p>
                </div>
              </div>
            </div>

            {/* Control Section */}
            <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-8 border border-stone-200 dark:border-stone-700">
              <h2 className="text-2xl font-black text-stone-900 dark:text-white mb-6 flex items-center gap-2">
                <i className="fas fa-sliders-h text-emerald-600" />
                Motor Control
              </h2>

              {/* Motor Status */}
              <div className="mb-6 p-4 rounded-xl border-2 border-dashed" style={{
                borderColor: data.motorState ? '#10b981' : '#6b7280',
                backgroundColor: data.motorState ? '#ecfdf5' : '#f9fafb'
              }}>
                <div className="dark:invert">
                  <p className="text-sm font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-2">
                    Motor Status
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full animate-pulse ${
                      data.motorState ? 'bg-emerald-500' : 'bg-gray-400'
                    }`} />
                    <p className="text-2xl font-black" style={{
                      color: data.motorState ? '#10b981' : '#6b7280'
                    }}>
                      {data.motorState ? 'ON' : 'OFF'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mode Display */}
              <div className="mb-6 p-4 bg-stone-50 dark:bg-stone-900 rounded-xl">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-2">
                  Current Mode
                </p>
                <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">{data.mode}</p>
              </div>

              {/* Control Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleControl('normal')}
                  disabled={actionLoading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 text-white font-black rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                >
                  <i className="fas fa-leaf" />
                  {actionLoading ? 'Processing...' : 'Auto Mode'}
                </button>

                <button
                  onClick={() => handleControl('forceon')}
                  disabled={actionLoading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-black rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                >
                  <i className="fas fa-power-off" />
                  {actionLoading ? 'Processing...' : 'Force ON'}
                </button>

                <button
                  onClick={() => handleControl('forceoff')}
                  disabled={actionLoading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 text-white font-black rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                >
                  <i className="fas fa-stop" />
                  {actionLoading ? 'Processing...' : 'Force OFF'}
                </button>

                <div className="h-px bg-stone-300 dark:bg-stone-600 my-4" />

                <a
                  href={`http://${HARDWARE_IP}:${HARDWARE_PORT}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-6 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-900 dark:text-white font-bold rounded-xl transition-all shadow-md text-center text-xs uppercase tracking-wide"
                >
                  <i className="fas fa-external-link-alt mr-2" />
                  Open ESP32 Directly ↗
                </a>
              </div>

              <p className="text-xs text-stone-500 dark:text-stone-400 mt-4 text-center">
                Auto Mode: Motor turns ON when soil is DRY
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HardwareControl;
