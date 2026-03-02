/**
 * Smart Irrigation API Client
 * Handles all API communication with Node.js backend
 */

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface SensorData {
  moisture_pct: number;
  moisture_raw: number;
  temperature: number;
  humidity: number;
  pump_mode: string;
  rssi: number;
  uptime_s: number;
  ip: string;
}

interface UserSession {
  token: string;
  username: string;
  role: string;
  permissions: string[];
}

const API_BASE = 'http://localhost:5000/api';

/**
 * Authentication API
 */
export const AuthAPI = {
  /**
   * Login with username and password
   */
  login: async (username: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Authentication error'
      };
    }
  },
  
  /**
   * Verify OTP
   */
  verifyOTP: async (token: string, otp: string): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${API_BASE}/auth/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, otp })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OTP verification failed');
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'OTP verification error'
      };
    }
  },
  
  /**
   * Verify biometric
   */
  verifyBiometric: async (token: string, biometric: any): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${API_BASE}/auth/biometric`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, biometric })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Biometric verification failed');
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Biometric verification error'
      };
    }
  },
  
  /**
   * Logout
   */
  logout: async (token: string): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'x-session-token': token }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Logout failed');
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Logout error'
      };
    }
  }
};

/**
 * Hardware Sensor API
 */
export const SensorAPI = {
  /**
   * Get real-time sensor data
   */
  getSensorData: async (token: string): Promise<ApiResponse<SensorData>> => {
    try {
      const res = await fetch(`${API_BASE}/hardware/sensors`, {
        headers: { 'x-session-token': token }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch sensor data');
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Sensor API error'
      };
    }
  },
  
  /**
   * Get hardware status
   */
  getStatus: async (token: string): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${API_BASE}/hardware/status`, {
        headers: { 'x-session-token': token }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch status');
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Status API error'
      };
    }
  }
};

/**
 * Motor Control API
 */
export const MotorAPI = {
  /**
   * Turn motor ON
   */
  turnOn: async (token: string): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${API_BASE}/hardware/motor/on`, {
        method: 'POST',
        headers: { 'x-session-token': token }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to turn motor on');
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Motor control error'
      };
    }
  },
  
  /**
   * Turn motor OFF
   */
  turnOff: async (token: string): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${API_BASE}/hardware/motor/off`, {
        method: 'POST',
        headers: { 'x-session-token': token }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to turn motor off');
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Motor control error'
      };
    }
  },
  
  /**
   * Set AUTO mode
   */
  setAutoMode: async (token: string): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${API_BASE}/hardware/motor/auto`, {
        method: 'POST',
        headers: { 'x-session-token': token }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to set auto mode');
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Motor control error'
      };
    }
  },
  
  /**
   * Set MANUAL mode
   */
  setManualMode: async (token: string): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${API_BASE}/hardware/motor/manual`, {
        method: 'POST',
        headers: { 'x-session-token': token }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to set manual mode');
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Motor control error'
      };
    }
  }
};

/**
 * Configuration API
 */
export const ConfigAPI = {
  /**
   * Get hardware configuration
   */
  getConfig: async (token: string): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${API_BASE}/hardware/config`, {
        headers: { 'x-session-token': token }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch config');
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Config API error'
      };
    }
  },
  
  /**
   * Update hardware configuration
   */
  updateConfig: async (token: string, config: any): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${API_BASE}/hardware/config/update`, {
        method: 'POST',
        headers: {
          'x-session-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update config');
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Config API error'
      };
    }
  }
};

/**
 * Alerts API
 */
export const AlertAPI = {
  /**
   * Send SMS alert
   */
  sendSMS: async (token: string, phone: string, message: string): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${API_BASE}/alerts/sms`, {
        method: 'POST',
        headers: {
          'x-session-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, message })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send SMS');
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'SMS API error'
      };
    }
  }
};

/**
 * Health Check
 */
export const HealthAPI = {
  check: async (): Promise<ApiResponse> => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      return { success: res.ok, data };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Health check failed'
      };
    }
  }
};

/**
 * Session Management Helpers
 */
export const SessionManager = {
  saveSession: (session: UserSession) => {
    localStorage.setItem('axis_hw_token', session.token);
    localStorage.setItem('axis_hw_user', JSON.stringify({
      username: session.username,
      role: session.role,
      permissions: session.permissions
    }));
  },
  
  getSession: (): UserSession | null => {
    const token = localStorage.getItem('axis_hw_token');
    const userStr = localStorage.getItem('axis_hw_user');
    
    if (!token || !userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      return { ...user, token };
    } catch {
      return null;
    }
  },
  
  clearSession: () => {
    localStorage.removeItem('axis_hw_token');
    localStorage.removeItem('axis_hw_user');
  }
};

export default {
  AuthAPI,
  SensorAPI,
  MotorAPI,
  ConfigAPI,
  AlertAPI,
  HealthAPI,
  SessionManager
};
