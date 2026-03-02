import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HARDWARE_IP = '10.57.97.215';
const HARDWARE_PORT = 80;

interface SensorReading {
  timestamp: number;
  moisture: number;
  temperature: number;
  humidity: number;
}

interface HardwareData {
  moisture: number;
  soilCondition: 'WET' | 'DRY';
  temperature: number;
  humidity: number;
  motorState: boolean;
  mode: 'AUTO' | 'FORCE ON' | 'FORCE OFF';
}

const HardwareDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<HardwareData | null>(null);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    avgMoisture: 0,
    avgTemp: 0,
    avgHumidity: 0,
    motorUptime: 0,
  });

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

  useEffect(() => {
    calculateStats();
  }, [readings]);

  const fetchHardwareData = async () => {
    try {
      const response = await fetch(`http://${HARDWARE_IP}:${HARDWARE_PORT}/`, {
        method: 'GET',
      });

      if (!response.ok) throw new Error('Failed to fetch hardware data');

      const html = await response.text();
      const newData = parseHardwareData(html);
      setData(newData);

      // Record reading
      setReadings((prev) => [
        ...prev.slice(-59), // Keep last 60 readings
        {
          timestamp: Date.now(),
          moisture: newData.moisture,
          temperature: newData.temperature,
          humidity: newData.humidity,
        },
      ]);

      setError('');
    } catch (err) {
      setError(`Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
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

  const calculateStats = () => {
    if (readings.length === 0) return;

    const avgMoisture = Math.round(
      readings.reduce((sum, r) => sum + r.moisture, 0) / readings.length
    );
    const avgTemp = Math.round(
      readings.reduce((sum, r) => sum + r.temperature, 0) / readings.length
    );
    const avgHumidity = Math.round(
      readings.reduce((sum, r) => sum + r.humidity, 0) / readings.length
    );

    setStats({
      avgMoisture,
      avgTemp,
      avgHumidity,
      motorUptime: Math.round((readings.filter((r, i) => data && i > 0 && readings[i - 1]).length / readings.length) * 100),
    });
  };

  const getSoilHealthStatus = () => {
    if (!data) return { status: 'Unknown', color: 'gray', icon: '?' };
    if (data.soilCondition === 'WET') {
      return { status: 'Healthy', color: 'emerald', icon: '✓' };
    } else {
      return { status: 'Dry', color: 'orange', icon: '!' };
    }
  };

  const getMotorHealthStatus = () => {
    if (!data) return { status: 'Unknown', color: 'gray' };
    return data.motorState
      ? { status: 'Running', color: 'emerald' }
      : { status: 'Standby', color: 'blue' };
  };

  const healthStatus = getSoilHealthStatus();
  const motorStatus = getMotorHealthStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 to-stone-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 px-4 py-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            ← Back
          </button>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-5xl font-black text-white tracking-tight flex items-center gap-3">
              <i className="fas fa-chart-line text-emerald-500" />
              Smart Irrigation Dashboard
            </h1>
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${
              error ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {error ? '⚠ Offline' : '● Online'}
            </div>
          </div>
          <p className="text-stone-400 font-medium">
            Hardware IP: <span className="text-emerald-400">{HARDWARE_IP}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {loading || !data ? (
          <div className="text-center py-20">
            <div className="inline-block">
              <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
            <p className="mt-4 text-stone-400 font-medium">Loading dashboard...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Soil Health */}
              <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-blue-500/30 rounded-2xl p-6 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-stone-300">
                    <i className="fas fa-leaf mr-2 text-blue-400" />
                    Soil Status
                  </h3>
                  <div className={`w-3 h-3 rounded-full bg-${healthStatus.color}-500 animate-pulse`} />
                </div>
                <p className={`text-3xl font-black text-${healthStatus.color}-400 mb-2`}>
                  {healthStatus.status}
                </p>
                <p className="text-xs text-stone-400">
                  Moisture: {data.soilCondition}
                </p>
              </div>

              {/* Motor Status */}
              <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-2xl p-6 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-stone-300">
                    <i className="fas fa-power-off mr-2 text-purple-400" />
                    Motor Status
                  </h3>
                  <div className={`w-3 h-3 rounded-full bg-${motorStatus.color}-500 ${data.motorState ? 'animate-pulse' : ''}`} />
                </div>
                <p className={`text-3xl font-black text-${motorStatus.color}-400 mb-2`}>
                  {motorStatus.status}
                </p>
                <p className="text-xs text-stone-400">
                  Mode: {data.mode}
                </p>
              </div>

              {/* System Health */}
              <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-stone-300">
                    <i className="fas fa-heartbeat mr-2 text-emerald-400" />
                    System Health
                  </h3>
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-3xl font-black text-emerald-400 mb-2">100%</p>
                <p className="text-xs text-stone-400">All systems operational</p>
              </div>
            </div>

            {/* Current Readings */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Moisture */}
              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6 backdrop-blur">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    <i className="fas fa-droplet mr-2 text-blue-400" />
                    Moisture
                  </p>
                </div>
                <p className="text-4xl font-black text-blue-400 mb-1">{data.moisture}</p>
                <p className="text-xs text-stone-500">ADC Value</p>
                <div className="mt-3 h-1.5 bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all"
                    style={{ width: `${Math.min((data.moisture / 4095) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Temperature */}
              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6 backdrop-blur">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    <i className="fas fa-thermometer mr-2 text-red-400" />
                    Temperature
                  </p>
                </div>
                <p className="text-4xl font-black text-red-400 mb-1">{data.temperature}°C</p>
                <p className="text-xs text-stone-500">Average: {stats.avgTemp}°C</p>
                <div className="mt-3 h-1.5 bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-600 to-red-500 transition-all"
                    style={{ width: `${Math.min((data.temperature / 50) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Humidity */}
              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6 backdrop-blur">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    <i className="fas fa-wind mr-2 text-purple-400" />
                    Humidity
                  </p>
                </div>
                <p className="text-4xl font-black text-purple-400 mb-1">{data.humidity}%</p>
                <p className="text-xs text-stone-500">Average: {stats.avgHumidity}%</p>
                <div className="mt-3 h-1.5 bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-purple-500 transition-all"
                    style={{ width: `${data.humidity}%` }}
                  />
                </div>
              </div>

              {/* Data Points */}
              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6 backdrop-blur">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    <i className="fas fa-database mr-2 text-emerald-400" />
                    Data Points
                  </p>
                </div>
                <p className="text-4xl font-black text-emerald-400 mb-1">{readings.length}</p>
                <p className="text-xs text-stone-500">Readings recorded</p>
                <div className="mt-3 h-1.5 bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-600 to-emerald-500 transition-all"
                    style={{ width: `${Math.min((readings.length / 60) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-stone-800/50 border border-stone-700 rounded-2xl p-6 backdrop-blur">
              <h3 className="text-lg font-black text-white mb-4">
                <i className="fas fa-sliders-h mr-2 text-emerald-400" />
                Quick Control
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/hardwarecontrol')}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  <i className="fas fa-leaf mr-2" />
                  Go to Control Panel
                </button>
                <button
                  onClick={fetchHardwareData}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  <i className="fas fa-sync mr-2" />
                  Refresh Data
                </button>
                <button
                  onClick={() => setReadings([])}
                  className="px-6 py-3 bg-gradient-to-r from-stone-700 to-stone-600 hover:from-stone-800 hover:to-stone-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  <i className="fas fa-trash mr-2" />
                  Clear Readings
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4 backdrop-blur text-center text-xs text-stone-400">
              <i className="fas fa-info-circle mr-2" />
              Dashboard updates automatically every 3 seconds
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HardwareDashboard;
