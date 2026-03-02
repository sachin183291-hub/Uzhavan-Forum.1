/**
 * Smart Irrigation Integration Guide
 * How to add the SmartIrrigation component to your React app
 */

// ═══════════════════════════════════════════════════════════════════════════
// STEP 1: Update your main App.tsx or routing file
// ═══════════════════════════════════════════════════════════════════════════

// Add this import to your App.tsx:
import SmartIrrigation from '@/pages/SmartIrrigation';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Add this route to your routing configuration:
const AppRouter = () => (
  <Routes>
    {/* ... existing routes ... */}
    
    {/* AXIS Hardware System */}
    <Route path="/axis-login" element={<AxisLogin />} />
    <Route path="/axis-dashboard" element={<AxisDashboard />} />
    
    {/* NEW: Smart Irrigation System */}
    <Route path="/smart-irrigation" element={<SmartIrrigation />} />
    
    {/* ... rest of routes ... */}
  </Routes>
);

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2: Update your Navbar/Navigation
// ═══════════════════════════════════════════════════════════════════════════

// Add this link to your navigation menu:
import { Link } from 'react-router-dom';

export const NavigationMenu = () => (
  <nav>
    {/* ... existing navigation ... */}
    
    {/* Smart Irrigation Link */}
    <Link to="/smart-irrigation" className="nav-item">
      🌱 Smart Irrigation
    </Link>
    
    {/* ... rest of navigation ... */}
  </nav>
);

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3: Create a Middleware for Hardware Authentication
// ═══════════════════════════════════════════════════════════════════════════

// Create file: hooks/useHardwareAuth.ts

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionManager } from '@/utils/smartIrrigationApi';

interface UseHardwareAuthReturn {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any | null;
  login: (username: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

export const useHardwareAuth = (): UseHardwareAuthReturn => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  // Check session on mount
  useEffect(() => {
    const session = SessionManager.getSession();
    if (session) {
      setIsAuthenticated(true);
      setUser({ username: session.username, role: session.role });
    }
    setIsLoading(false);
  }, []);
  
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Call your login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) throw new Error('Login failed');
      
      const data = await response.json();
      if (data.success) {
        SessionManager.saveSession({
          token: data.data.token,
          username: data.data.user.username,
          role: data.data.user.role,
          permissions: data.data.user.permissions
        });
        
        setIsAuthenticated(true);
        setUser(data.data.user);
        return data;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    setIsLoading(true);
    try {
      const session = SessionManager.getSession();
      if (session?.token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'x-session-token': session.token }
        });
      }
    } finally {
      SessionManager.clearSession();
      setIsAuthenticated(false);
      setUser(null);
      navigate('/axis-login');
      setIsLoading(false);
    }
  };
  
  return { isLoading, isAuthenticated, user, login, logout };
};

// ═══════════════════════════════════════════════════════════════════════════
// STEP 4: Create a Protected Route Component
// ═══════════════════════════════════════════════════════════════════════════

// Create file: components/ProtectedHardwareRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { SessionManager } from '@/utils/smartIrrigationApi';

interface ProtectedHardwareRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
}

export const ProtectedHardwareRoute: React.FC<ProtectedHardwareRouteProps> = ({
  children,
  requiredRole,
  requiredPermission
}) => {
  const session = SessionManager.getSession();
  
  if (!session) {
    return <Navigate to="/axis-login" replace />;
  }
  
  if (requiredRole && session.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900">
        <div className="text-center">
          <p className="text-red-500 font-bold">Access Denied</p>
          <p className="text-stone-400">Required role: {requiredRole}</p>
        </div>
      </div>
    );
  }
  
  if (requiredPermission && !session.permissions?.includes(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900">
        <div className="text-center">
          <p className="text-red-500 font-bold">Access Denied</p>
          <p className="text-stone-400">Required permission: {requiredPermission}</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

// ═══════════════════════════════════════════════════════════════════════════
// STEP 5: Update your routes with protection
// ═══════════════════════════════════════════════════════════════════════════

const AppRouter = () => (
  <Routes>
    {/* ... existing routes ... */}
    
    <Route path="/axis-login" element={<AxisLogin />} />
    
    {/* Protected Smart Irrigation Route */}
    <Route 
      path="/smart-irrigation" 
      element={
        <ProtectedHardwareRoute requiredPermission="write">
          <SmartIrrigation />
        </ProtectedHardwareRoute>
      } 
    />
    
    {/* Admin only route */}
    <Route 
      path="/hardware-settings" 
      element={
        <ProtectedHardwareRoute requiredRole="Admin">
          <HardwareSettings />
        </ProtectedHardwareRoute>
      } 
    />
  </Routes>
);

// ═══════════════════════════════════════════════════════════════════════════
// STEP 6: Use the API Client in your components
// ═══════════════════════════════════════════════════════════════════════════

// Example: Using SensorAPI in a custom component

import React, { useEffect, useState } from 'react';
import { SensorAPI, SessionManager } from '@/utils/smartIrrigationApi';

const SensorDashboard = () => {
  const [sensors, setSensors] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      const session = SessionManager.getSession();
      if (!session?.token) return;
      
      const response = await SensorAPI.getSensorData(session.token);
      if (response.success) {
        setSensors(response.data);
      }
      setLoading(false);
    };
    
    fetchData();
    const interval = setInterval(fetchData, 4000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (loading) return <div>Loading sensors...</div>;
  
  return (
    <div>
      <h2>Sensor Data</h2>
      <p>Moisture: {sensors?.moisture_pct}%</p>
      <p>Temperature: {sensors?.temperature}°C</p>
      <p>Humidity: {sensors?.humidity}%</p>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STEP 7: Start the backend server
// ═══════════════════════════════════════════════════════════════════════════

// In your terminal:
// npm install  (install new dependencies)
// npm run dev:all  (starts both frontend and API server)

// Or run separately:
// npm run dev          (Frontend on port 3000)
// npm run dev:server   (API on port 5000)

// ═══════════════════════════════════════════════════════════════════════════
// STEP 8: Environment Variables
// ═══════════════════════════════════════════════════════════════════════════

// Update .env.local:
/*
GEMINI_API_KEY=your_api_key_here
VITE_API_URL=http://localhost:5000/api
VITE_HARDWARE_IP=10.57.97.215
NODE_ENV=development
*/

// ═══════════════════════════════════════════════════════════════════════════
// COMPLETE EXAMPLE: Integrated into App.tsx
// ═══════════════════════════════════════════════════════════════════════════

/*

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Pages
import Home from '@/pages/Home';
import AxisLogin from '@/pages/AxisLogin';
import AxisDashboard from '@/pages/AxisDashboard';
import SmartIrrigation from '@/pages/SmartIrrigation';

// Protected Route
import { ProtectedHardwareRoute } from '@/components/ProtectedHardwareRoute';

function App() {
  return (
    <Router>
      <Navbar />
      
      <Routes>
        {/* Main Routes */}
        <Route path="/" element={<Home />} />
        
        {/* Hardware Routes */}
        <Route path="/axis-login" element={<AxisLogin />} />
        <Route path="/axis-dashboard" element={<ProtectedHardwareRoute><AxisDashboard /></ProtectedHardwareRoute>} />
        
        {/* NEW: Smart Irrigation */}
        <Route 
          path="/smart-irrigation" 
          element={
            <ProtectedHardwareRoute requiredPermission="read">
              <SmartIrrigation />
            </ProtectedHardwareRoute>
          } 
        />
      </Routes>
      
      <Footer />
    </Router>
  );
}

export default App;

*/

// ═══════════════════════════════════════════════════════════════════════════
// TROUBLESHOOTING
// ═══════════════════════════════════════════════════════════════════════════

/*

1. API Connection Error?
   - Ensure backend is running: npm run dev:server
   - Check port 5000 is not in use
   - Verify hardware IP in server.js

2. Authentication Issues?
   - Check credentials in server.js (HARDWARE_USERS object)
   - Clear localStorage: localStorage.clear()
   - Try logging in again

3. Sensor Data Not Updating?
   - Check WiFi connection on ESP32
   - Verify GPIO pins are correct
   - Check Arduino Serial output

4. CORS Errors?
   - Ensure CORS middleware is loaded in server.js
   - Check browser console for detailed error
   - Verify routes have proper headers

5. Motor Not Responding?
   - Check relay wiring and GPIO pin
   - Verify power supply to motor
   - Check ESP32 serial logs

*/

// ═══════════════════════════════════════════════════════════════════════════
// ADDITIONAL FEATURES YOU CAN ADD
// ═══════════════════════════════════════════════════════════════════════════

/*

1. Historical Data Logging:
   - Store sensor readings in database
   - Create analytics dashboard
   - Export data as CSV

2. Advanced Scheduling:
   - Create watering schedules
   - Set time-based automation
   - Sunrise/sunset integration

3. Weather Integration:
   - Skip watering if rain predicted
   - Adjust moisture thresholds by season
   - Integration with Open-Meteo API (already available)

4. Mobile App:
   - React Native version
   - Push notifications for alerts
   - Offline mode support

5. Multi-Hardware Support:
   - Control multiple ESP32 devices
   - Zone-based irrigation
   - Distributed farm management

6. AI Optimization:
   - ML-based watering predictions
   - Soil type adaptation
   - Crop-specific profiles

*/
